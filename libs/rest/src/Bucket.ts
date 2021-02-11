import { RestManager } from './RestManager';
import { discordFetch, DiscordFetchOptions } from './Fetch';
import { Response } from 'node-fetch';
import { HTTPError, MESSAGES } from './HTTPError';
import { Queue } from '@cordis/queue';
import { halt } from '@cordis/common';

export interface RatelimitData {
  global: boolean;
  limit: number;
  timeout: number;
  remaining: number;
}

/**
 * Represents a rate limiting bucket for Discord's API
 */
export class Bucket {
  /**
   * Creates a simple API route representation (e.g. /users/:id), used as an identifier for each bucket
   * Credit to https://github.com/abalabahaha/eris
   */
  public static makeRoute(method: string, url: string) {
    let route = url
      .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) => (['channels', 'guilds', 'webhook'].includes(p) ? match : `/${p}/:id`))
      .replace(/\/reactions\/[^/]+/g, '/reactions/:id')
      .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token')
      .replace(/\?.*$/, '');

    if (method === 'delete' && route.endsWith('/messages/:id')) route = method + route;

    return route;
  }

  /**
   * The request queue
   */
  public queue = new Queue<any>();

  /**
   * @param manager The rest manager instance being used by this bucket
   * @param route The identifier of this bucket
   */
  public constructor(
    public readonly manager: RestManager,
    public readonly route: string
  ) {}

  /**
   * Makes a request with the given options
   * @param req Request options
   * @param urgent Wether this request should be given priority or not
   */
  public make<T, D, Q>(req: DiscordFetchOptions<D, Q>, urgent = false): Promise<T> {
    return this.queue.run(() => this._make(req), urgent);
  }

  /**
   * Handles rate limiting and responses
   * @param req Reqyest options
   */
  private async _make(req: DiscordFetchOptions): Promise<any> {
    await this.mutex.claim(this.route);

    const state = await this.manager.store.get(this.route) ?? {};
    const globalState = await this.manager.store.get('global') ?? {};

    if (state.remaining === 0 && state.resetAt && Date.now() < state.resetAt) {
      const waitingFor = state.resetAt - Date.now();
      this.manager.emit('ratelimit', this.route, `${req.method.toUpperCase()} ${req.path}`, true, waitingFor);
      await halt(waitingFor);
    } else if (globalState.active && globalState.resetAt && Date.now() < globalState.resetAt) {
      const waitingFor = globalState.resetAt - Date.now();
      this.manager.emit('ratelimit', this.route, 'GLOBAL', true, waitingFor);
      await halt(waitingFor);

      globalState.active = false;
      await this.manager.store.set('global', globalState);
    }

    this.manager.emit('request', req);
    const res = await discordFetch(req);

    state.limit = Number(res.headers.get('x-ratelimit-limit'));
    state.remaining = Number(res.headers.get('x-ratelimit-remaining'));
    state.resetAfter = Number(res.headers.get('x-ratelimit-reset-after')) * 1000;
    state.resetAt = Date.now() + state.resetAfter;

    await this.manager.store.set(this.route, state);

    if (res.status === 429) {
      const data = await res.json();
      const period = data.retry_after * 1000;

      this.manager.emit('ratelimit', this.route, `${req.method.toUpperCase()} ${req.path}`, false, period);

      if (data.global) {
        globalState.active = true;
        globalState.resetAfter = period;
        globalState.resetAt = Date.now() + period;

        await this.manager.store.set('global', globalState);
      }

      await halt(period);
      return this._retry(req, res);
    } else if (res.status >= 500 && res.status < 600) {
      return this._retry(req, res);
    }

    if (!res.ok) throw new HTTPError(res.clone(), await res.text());

    let final: any = res;

    if (res.headers.get('content-type') === 'application/json') final = await res.json();
    else final = await res.blob();

    this.manager.emit('response', req, final, state);
    return final;
  }

  /**
   * Retries to make a request after failure
   * @param req Request options
   * @param res Response given
   */
  private _retry(req: DiscordFetchOptions, res: Response) {
    if (req.failures) req.failures++;
    else req.failures = 1;

    if (req.failures > this.manager.retries) {
      throw new HTTPError(res.clone(), MESSAGES.retryLimitExceeded(`${req.method.toUpperCase()} ${req.path}`, this.manager.retries));
    }

    return this._make(req);
  }
}

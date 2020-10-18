import { RestManager } from './RestManager';
import { discordFetch, RequestBuilderOptions } from './Fetch';
import { Response } from 'node-fetch';
import { HTTPError, MESSAGES } from './HTTPError';
import { AsyncQueue, halt } from '@cordis/util';

export interface RatelimitData {
  global: boolean;
  limit: number;
  remaining: number;
  resetAfter: number;
  resetAt: number;
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
   * The current rate limit state for this endpoint
   */
  public state: Partial<RatelimitData> = {};

  /**
   * The request queue
   */
  public queue = new AsyncQueue<unknown>();

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
  public make(req: RequestBuilderOptions, urgent = false) {
    return this.queue.run(() => this._make(req), urgent);
  }

  /**
   * Does the actual HTTP magic
   * @param req Reqyest options
   */
  private async _make(req: RequestBuilderOptions): Promise<any> {
    const { state } = this;

    if (state.remaining === 0 && Date.now() < (state.resetAt ?? 0)) {
      const waitingFor = state.resetAt! - Date.now();
      this.manager.emit('ratelimit', this.route, `${req.method.toUpperCase()} ${req.path}`, true, waitingFor);
      await halt(waitingFor);
    }

    this.manager.emit('request', req);
    const res = await discordFetch(req);

    state.global = res.headers.get('x-ratelimit-global') === 'true';
    state.limit = Number(res.headers.get('x-ratelimit-limit'));
    state.remaining = Number(res.headers.get('x-ratelimit-remaining'));
    state.resetAfter = Number(res.headers.get('x-ratelimit-reset-after')) * 1000;
    state.resetAt = Date.now() + state.resetAfter;

    if (res.status === 429) {
      const period = Number(res.headers.get('retry-after') ?? 0);
      this.manager.emit('ratelimit', this.route, `${req.method.toUpperCase()} ${req.path}`, false, period);

      await halt(period * 1000);
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
  private _retry(req: RequestBuilderOptions, res: Response) {
    if (req.failures) req.failures++;
    else req.failures = 1;

    if (req.failures > this.manager.retries) {
      throw new HTTPError(res.clone(), MESSAGES.retryLimitExceeded(`${req.method.toUpperCase()} ${req.path}`, this.manager.retries));
    }

    return this._make(req);
  }
}

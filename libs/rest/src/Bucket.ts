import { discordFetch, DiscordFetchOptions } from './Fetch';
import { CordisRestError, HTTPError } from './Error';
import { halt } from '@cordis/common';
import type { RestManager } from './RestManager';

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
   * @param manager The rest manager instance being used by this bucket
   * @param route The identifier of this bucket
   */
  public constructor(
    public readonly manager: RestManager,
    public readonly route: string
  ) {}

  public get mutex() {
    return this.manager.mutex;
  }

  /**
   * Makes a request to Discord
   * @param req Request options
   */
  public async make<T, D, Q>(req: DiscordFetchOptions<D, Q>): Promise<T> {
    await this.mutex.claim(this.route);

    this.manager.emit('request', req);
    const res = await discordFetch(req);

    const global = res.headers.get('x-ratelimit-global');
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetAfter = res.headers.get('x-ratelimit-reset-after');

    const state: Partial<RatelimitData> = {};
    if (global) state.global = global === 'true';
    if (limit) state.limit = Number(limit);
    if (remaining) state.remaining = Number(remaining);
    if (resetAfter) state.timeout = Number(resetAfter) * 1000;

    await this.mutex.set(this.route, state);

    if (res.status === 429) {
      const retry = res.headers.get('Retry-After');
      const retryAfter = retry ? Number(retry) * 1000 : 0;

      this.manager.emit('ratelimit', this.route, req.path, retryAfter);

      await this.mutex.set(this.route, { timeout: retryAfter });
      return this._retry(req);
    } else if (res.status >= 500 && res.status < 600) {
      await halt(1000);
      return this._retry(req);
    } else if (!res.ok) {
      throw new HTTPError(res.clone(), await res.text());
    }

    let final: any;

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
  private _retry<T>(req: DiscordFetchOptions): Promise<T> {
    if (req.failures) req.failures++;
    else req.failures = 1;

    if (req.failures > this.manager.retries) {
      throw new CordisRestError('retryLimitExceeded', `${req.method.toUpperCase()} ${req.path}`, this.manager.retries);
    }

    return this.make(req);
  }
}

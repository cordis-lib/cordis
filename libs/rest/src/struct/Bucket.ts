import { discordFetch, DiscordFetchOptions } from '../Fetch';
import { CordisRestError, HTTPError } from '../Error';
import type { Rest } from './Rest';

/**
 * Data held to represent ratelimit state for a Bucket
 */
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
   * Creates a simple API route representation (e.g. /users/:id), used as an identifier for each bucket.
   *
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
   * @param rest The rest manager using this bucket instance
   * @param route The identifier of this bucket
   */
  public constructor(
    public readonly rest: Rest,
    public readonly route: string
  ) {}

  /**
   * Shortcut for the manager mutex
   */
  public get mutex() {
    return this.rest.mutex;
  }

  /**
   * Makes a request to Discord
   * @param req Request options
   */
  public async make<T, D, Q>(req: DiscordFetchOptions<D, Q>): Promise<T> {
    this.rest.emit('request', req);

    const mutexTimeout = await this.mutex.claim(this.route);
    if (mutexTimeout > 0) {
      this.rest.emit('ratelimit', this.route, req.path, true, mutexTimeout);
      if (!req.retryAfterRatelimit) return Promise.reject(new CordisRestError('rateLimited', `${req.method.toUpperCase()} ${req.path}`));
    }

    let timeout: NodeJS.Timeout;
    if (req.implicitAbortBehavior) {
      timeout = setTimeout(() => req.controller.abort(), this.rest.abortAfter);
    }

    const res = await discordFetch(req).finally(() => clearTimeout(timeout));

    const global = res.headers.get('x-ratelimit-global');
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetAfter = res.headers.get('x-ratelimit-reset-after');

    const state: Partial<RatelimitData> = {};
    if (global) state.global = global === 'true';
    if (limit) state.limit = Number(limit);
    if (remaining) state.remaining = Number(remaining);
    if (resetAfter) state.timeout = Number(resetAfter) * 1000;
    this.rest.emit('response', req, res.clone(), state);

    await this.mutex.set(this.route, state);

    if (res.status === 429) {
      const retry = res.headers.get('retry-after');
      /* istanbul ignore next */
      const retryAfter = Number(retry ?? 1) * 1000;

      this.rest.emit('ratelimit', this.route, req.path, false, retryAfter);

      await this.mutex.set(this.route, { timeout: retryAfter });
      return Promise.reject(new CordisRestError('rateLimited', `${req.method.toUpperCase()} ${req.path}`));
    } else if (res.status >= 500 && res.status < 600) {
      return Promise.reject(new CordisRestError('internal', `${req.method.toUpperCase()} ${req.path}`));
    } else if (!res.ok) {
      return Promise.reject(new HTTPError(res.clone(), await res.text()));
    }

    if (res.headers.get('content-type')?.startsWith('application/json')) {
      return res.json();
    }

    return res.blob() as unknown as T;
  }
}

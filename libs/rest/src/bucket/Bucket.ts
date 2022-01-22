import { discordFetch, DiscordFetchOptions } from './Fetch';
import { CordisRestError, HTTPError } from '../Error';
import { BaseBucket } from './BaseBucket';
import type { Response } from 'node-fetch';
import { Rest } from '..';

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
 * Simple, default sequential bucket
 */
export class Bucket extends BaseBucket {
  protected readonly _destroyTimeout: NodeJS.Timeout;

  public constructor(rest: Rest, route: string) {
    super(rest, route);
    this._destroyTimeout = setTimeout(() => this.rest.buckets.delete(this.route), this.constructor.BUCKET_TTL).unref();
  }

  public async make<D, Q>(req: DiscordFetchOptions<D, Q>): Promise<Response> {
    this._destroyTimeout.refresh();

    this.rest.emit('request', req);

    const mutexTimeout = await this.mutex
      .claim(this.route, req.retryAfterRatelimit)
      // Would rather throw a ratelimit error
      .catch(() => Promise.reject(new CordisRestError('rateLimited', `${req.method.toUpperCase()} ${req.path}`)));

    if (mutexTimeout > 0 && !req.isRetryAfterRatelimit) {
      this.rest.emit('ratelimit', this.route, req.path, true, mutexTimeout);
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

    if (global) {
      state.global = global === 'true';
    }

    if (limit) {
      state.limit = Number(limit);
    }

    if (remaining) {
      state.remaining = Number(remaining);
    }

    if (resetAfter) {
      state.timeout = Number(resetAfter) * 1000;
    }

    this.rest.emit('response', req, res.clone(), state);

    await this.mutex.set(this.route, state);

    if (res.status === 429) {
      const retry = res.headers.get('retry-after');
      /* istanbul ignore next */
      const retryAfter = Number(retry ?? 1) * 1000;

      this.rest.emit('ratelimit', this.route, req.path, false, retryAfter);

      await this.mutex.set(this.route, { timeout: retryAfter });
      return Promise.reject(new CordisRestError('rateLimited', `${req.method.toUpperCase()} ${req.path}`));
    } else if (!res.ok) {
      return Promise.reject(new HTTPError(res.clone(), await res.text()));
    }

    return res;
  }
}

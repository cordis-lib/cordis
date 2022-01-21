import { DiscordFetchOptions } from './Fetch';
import type { Rest } from '../struct';
import type { Response } from 'node-fetch';

export interface BucketConstructor {
  makeRoute(method: string, url: string): string;
  new (rest: Rest, route: string): BaseBucket;
}

/**
 * Base bucket class - used to deal with all of the HTTP semantics
 */
export abstract class BaseBucket {
  /**
   * Time after a Bucket is destroyed if unused
   */
  public static readonly BUCKET_TTL = 1e4;

  /**
   * Creates a simple API route representation (e.g. /users/:id), used as an identifier for each bucket.
   *
   * Credit to https://github.com/abalabahaha/eris
   */
  public static makeRoute(method: string, url: string) {
    let route = url
      .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) => (['channels', 'guilds', 'webhook'].includes(p) ? match : `/${p}/:id`))
      .replace(/\/invites\/[\w\d-]{2,}/g, '/invites/:code')
      .replace(/\/reactions\/[^/]+/g, '/reactions/:id')
      .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token')
      .replace(/\?.*$/, '');

    // Message deletes have their own rate limit
    if (method === 'delete' && route.endsWith('/messages/:id')) {
      route = method + route;
    }

    // In this case, /channels/[idHere]/messages is correct,
    // however /channels/[idHere] is not. we need "/channels/:id"
    if (/^\/channels\/[0-9]{17,19}$/.test(route)) {
      route = route.replace(/[0-9]{17,19}/, ':id');
    }

    return route;
  }

  protected readonly _destroyTimeout: NodeJS.Timeout;

  public ['constructor']!: typeof BaseBucket;

  public constructor(
    public readonly rest: Rest,
    public readonly route: string
  ) {
    // This is in the base constructor for backwards compatibility - in the future it'll be only in the Bucket class
    this._destroyTimeout = setTimeout(() => this.rest.buckets.delete(this.route), this.constructor.BUCKET_TTL).unref();
  }

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
  public abstract make<D, Q>(req: DiscordFetchOptions<D, Q>): Promise<Response>;
}

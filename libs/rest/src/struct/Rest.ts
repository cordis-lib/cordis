import {
  BaseBucket,
  BucketConstructor,
  Bucket,
  RatelimitData,
  DiscordFetchOptions,
  File,
  RequestBodyData,
  StringRecord
} from '../fetcher';
import { USER_AGENT } from '../Constants';
import { EventEmitter } from 'events';
import { Headers, Response } from 'node-fetch';
import { Mutex, MemoryMutex } from '../mutex';
import AbortController from 'abort-controller';
import { CordisRestError, HTTPError } from '../Error';
import { halt } from '@cordis/common';
import type { Readable } from 'stream';
import { RouteBases } from 'discord-api-types/v9';

/**
 * Options for constructing a rest manager
 */
export interface RestOptions {
  /**
   * How many times to retry making a request before giving up
   *
   * Tip: If using ProxyBucket you should probably set this to 1 depending on your proxy server's implementation
   */
  retries?: number;
  /**
   * How long to wait before timing out on a request
   */
  abortAfter?: number;
  /**
   * Mutex implementation to use for rate limiting
   * @default MemoryMutex
   */
  mutex?: Mutex;
  /**
   * Wether or not requests, by default, should be re-attempted after a ratelimit is waited out
   * @default true
   */
  retryAfterRatelimit?: boolean;
  /**
   * Overwrites the default for `{@link RequestOptions.cacheTime}`
   */
  cacheTime?: number;
  /**
   * Bucket constructor to use
   */
  bucket?: BucketConstructor;
  /**
   * Overwrites the default domain used for every request
   */
  domain?: string;
}

export interface Rest {
  /**
   * Fired when a request is being started (pre-ratelimit checking)
   * @event
   */
  on(event: 'request', listener: (request: Partial<DiscordFetchOptions<unknown, unknown>>) => any): this;
  /**
   * Fired when Discord responds to a request
   * @event
   */
  on(
    event: 'response',
    listener: (request: Partial<DiscordFetchOptions<unknown, unknown>>, response: Response, ratelimit: Partial<RatelimitData>) => any
  ): this;
  /**
   * Fired when a rate limit is (about to be) hit.
   * @event
   */
  on(event: 'ratelimit', listener: (bucket: string, endpoint: string, prevented: boolean, waitingFor: number) => any): this;

  /** @internal */
  once(event: 'request', listener: (request: Partial<DiscordFetchOptions<unknown, unknown>>) => any): this;
  /** @internal */
  once(
    event: 'response',
    listener: (request: Partial<DiscordFetchOptions<unknown, unknown>>, response: Response, ratelimit: Partial<RatelimitData>) => any
  ): this;
  /** @internal */
  once(event: 'ratelimit', listener: (bucket: string, endpoint: string, prevented: boolean, waitingFor: number) => any): this;

  /** @internal */
  emit(event: 'request', request: Partial<DiscordFetchOptions<unknown, unknown>>): boolean;
  /** @internal */
  emit(
    event: 'response',
    request: Partial<DiscordFetchOptions<unknown, unknown>>,
    response: Response,
    ratelimit: Partial<RatelimitData>
  ): boolean;
  /** @internal */
  emit(event: 'ratelimit', bucket: string, endpoint: string, prevented: boolean, waitingFor: number): boolean;
}

/**
 * Options used for making a request
 */
export interface RequestOptions<D, Q> {
  /**
   * Path you're requesting
   */
  path: string;
  /**
   * Method you're using
   */
  method: string;
  /**
   * Extra HTTP headers to use - most of those are handled internally, but in case the library falls behind you can always use this
   */
  headers?: Headers;
  /**
   * Custom abort controller if you want to be able to cancel a request your own way - a timeout is set internally anyway
   */
  controller?: AbortController;
  /**
   * GET query
   */
  query?: Q | string;
  /**
   * Reason for the action - sets the X-Audit-Log-Reason header, as requested by Discord - seen in audit logs
   */
  reason?: string;
  /**
   * Files to send, if any
   */
  files?: File[];
  /**
   * Body to send, if any
   */
  data?: D | Readable;
  /**
   * Wether or not this request should be re-attempted after a ratelimit is waited out
   */
  retryAfterRatelimit?: boolean;
  /**
   * Wether or not the library should internally set a timeout for the I/O call
   */
  implicitAbortBehavior?: boolean;
  /**
   * Wether or not the library should cache the result of this call (ignored for non-GET requests)
   */
  cache?: boolean;
  /**
   * If `{@link RequestOptions.cache}` is set to `true`, how long should the cache live for?
   * @default 10000
   */
  cacheTime?: number;
  /**
   * Overwrites the domain used for this request - not taking into account the option passed into {@link RestOptions}
   */
  domain?: string;
}

/**
 * Base REST class used for making requests
 * @noInheritDoc
 */
export class Rest extends EventEmitter {
  /**
   * @internal
   */
  private readonly cache = new Map<string, any>();
  /**
   * @internal
   */
  private readonly cacheTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Current active rate limiting Buckets
   */
  public readonly buckets = new Map<string, BaseBucket>();

  public readonly retries: number;
  public readonly abortAfter: number;
  public readonly mutex: Mutex;
  public readonly retryAfterRatelimit: boolean;
  public readonly cacheTime: number;
  public readonly bucket: BucketConstructor;
  public readonly domain: string;

  /**
   * @param auth Your bot's Discord token
   * @param options Options for the REST manager
   */
  public constructor(
    public readonly auth: string,
    options: RestOptions = {}
  ) {
    super();
    const {
      retries = 3,
      abortAfter = 15e3,
      mutex = new MemoryMutex(),
      retryAfterRatelimit = true,
      cacheTime = 10000,
      bucket = Bucket,
      domain = RouteBases.api
    } = options;

    this.retries = retries;
    this.abortAfter = abortAfter;
    this.mutex = mutex;
    this.retryAfterRatelimit = retryAfterRatelimit;
    this.cacheTime = cacheTime;
    this.bucket = bucket;
    this.domain = domain;
  }

  /**
   * Prepares a request to Discord, associating it to the correct Bucket and attempting to prevent rate limits
   * @param options Options needed for making a request; only the path is required
   */
  public async make<D = RequestBodyData, Q = StringRecord>(options: RequestOptions<D, Q>): Promise<Response> {
    const route = this.bucket.makeRoute(options.method, options.path);

    let bucket = this.buckets.get(route);

    if (!bucket) {
      bucket = new this.bucket(this, route);
      this.buckets.set(route, bucket);
    }

    options.implicitAbortBehavior ??= !Boolean(options.controller);
    options.controller ??= new AbortController();
    options.retryAfterRatelimit ??= this.retryAfterRatelimit;

    options.headers ??= new Headers();
    options.headers.set('Authorization', `Bot ${this.auth}`);
    options.headers.set('User-Agent', USER_AGENT);
    if (options.reason) {
      options.headers.set('X-Audit-Log-Reason', encodeURIComponent(options.reason));
    }

    options.cacheTime ??= this.cacheTime;
    options.domain ??= this.domain;

    let isRetryAfterRatelimit = false;

    const isGet = options.method.toLowerCase() === 'get';
    const shouldCache = options.cache && isGet;

    let rejected: Promise<never>;

    for (let retries = 0; retries <= this.retries; retries++) {
      try {
        if (shouldCache && this.cache.has(options.path)) {
          return this.cache.get(options.path);
        }

        const data = await bucket.make<D, Q>({ ...options, isRetryAfterRatelimit } as DiscordFetchOptions<D, Q>);

        if (shouldCache || (isGet && this.cache.has(options.path))) {
          this.cache.set(options.path, data);

          if (this.cacheTimeouts.has(options.path)) {
            const timeout = this.cacheTimeouts.get(options.path)!;
            timeout.refresh();
          } else {
            this.cacheTimeouts.set(options.path, setTimeout(() => {
              this.cache.delete(options.path);
              this.cacheTimeouts.delete(options.path);
            }, options.cacheTime));
          }
        }

        return data;
      } catch (e: any) {
        const isRatelimit = e instanceof CordisRestError && e.code === 'rateLimited';
        isRetryAfterRatelimit = isRatelimit;

        if (e.name === 'AbortError') {
          return Promise.reject(e);
        }

        if (isRatelimit && !options.retryAfterRatelimit) {
          return Promise.reject(e);
        }

        if (e instanceof HTTPError) {
          if (e.response.status >= 500 && e.response.status < 600) {
            await halt(1000);
          } else {
            return Promise.reject(e);
          }
        }

        rejected = Promise.reject(e);
      }
    }

    return rejected!;
  }

  /**
   * Makes a GET request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */

  public async get<T, Q = StringRecord>(path: string, options: { query?: Q; cache?: boolean; cacheTime?: number } = {}): Promise<T> {
    const res = await this.make<never, Q>({ path, method: 'get', ...options });
    return res.json() as Promise<T>;
  }

  /**
   * Makes a DELETE request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public async delete<T, D = RequestBodyData>(path: string, options: { data?: D; reason?: string } = {}): Promise<T> {
    const res = await this.make<D, never>({ path, method: 'delete', ...options });
    return res.json() as Promise<T>;
  }

  /**
   * Makes a PATCH request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public async patch<T, D = RequestBodyData>(path: string, options: { data: D; reason?: string; files?: File[] }): Promise<T> {
    const res = await this.make<D, never>({ path, method: 'patch', ...options });
    return res.json() as Promise<T>;
  }

  /**
   * Makes a PUT request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public async put<T, D = RequestBodyData>(path: string, options?: { data?: D; reason?: string }): Promise<T> {
    const res = await this.make<D, never>({ path, method: 'put', ...options });
    return res.json() as Promise<T>;
  }

  /**
   * Makes a POST request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public async post<T, D = RequestBodyData, Q = StringRecord>(path: string, options: { data: D; reason?: string; files?: File[]; query?: Q }): Promise<T> {
    const res = await this.make<D, Q>({ path, method: 'post', ...options });
    return res.json() as Promise<T>;
  }
}

import { Bucket, RatelimitData } from './Bucket';
import { USER_AGENT } from '../Constants';
import { EventEmitter } from 'events';
import { Headers, Response } from 'node-fetch';
import { Mutex, MemoryMutex } from '../mutex';
import AbortController from 'abort-controller';
import { CordisRestError, HTTPError } from '../Error';
import { halt } from '@cordis/common';
import type { DiscordFetchOptions, File, RequestBodyData, StringRecord } from '../Fetch';

/**
 * Options for constructing a rest manager
 */
export interface RestOptions {
  /**
   * How many times to retry making a request before giving up
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
  data?: D;
  /**
   * Wether or not this request should be re-attempted after a ratelimit is waited out
   */
  retryAfterRatelimit?: boolean;
  /**
   * Wether or not the library should internally set a timeout for the I/O call
   */
  implicitAbortBehavior?: boolean;
}

/**
 * Base REST class used for making requests
 * @noInheritDoc
 */
export class Rest extends EventEmitter {
  /**
   * Current active rate limiting Buckets
   */
  private readonly _buckets = new Map<string, Bucket>();

  public readonly retries: number;
  public readonly abortAfter: number;
  public readonly mutex: Mutex;
  public readonly retryAfterRatelimit: boolean;

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
      retryAfterRatelimit = true
    } = options;

    this.retries = retries;
    this.abortAfter = abortAfter;
    this.mutex = mutex;
    this.retryAfterRatelimit = retryAfterRatelimit;
  }

  /**
   * Prepares a request to Discord, associating it to the correct Bucket and attempting to prevent rate limits
   * @param options Options needed for making a request; only the path is required
   */
  public async make<T, D = RequestBodyData, Q = StringRecord>(options: RequestOptions<D, Q>): Promise<T> {
    const route = Bucket.makeRoute(options.method, options.path);

    let bucket = this._buckets.get(route);

    if (!bucket) {
      bucket = new Bucket(this, route);
      this._buckets.set(route, bucket);
    }

    options.implicitAbortBehavior ??= !Boolean(options.controller);
    options.controller ??= new AbortController();
    options.retryAfterRatelimit ??= this.retryAfterRatelimit;

    options.headers ??= new Headers();
    options.headers.set('Authorization', `Bot ${this.auth}`);
    options.headers.set('User-Agent', USER_AGENT);
    if (options.reason) options.headers.set('X-Audit-Log-Reason', encodeURIComponent(options.reason));

    let isRetryAfterRatelimit = false;

    for (let retries = 0; retries <= this.retries; retries++) {
      try {
        return await bucket.make<T, D, Q>({ ...options, isRetryAfterRatelimit } as DiscordFetchOptions<D, Q>);
      } catch (e) {
        const isRatelimit = isRetryAfterRatelimit = e instanceof CordisRestError && e.code === 'rateLimited';

        if (
          e instanceof HTTPError ||
          e.name === 'AbortError' ||
          (isRatelimit && !options.retryAfterRatelimit)
        ) {
          return Promise.reject(e);
        }

        if (e instanceof CordisRestError && e.code === 'internal') {
          await halt(1000);
        }
      }
    }

    return Promise.reject(new CordisRestError('retryLimitExceeded', `${options.method.toUpperCase()} ${options.path}`, this.retries));
  }

  /**
   * Makes a GET request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public get<T, Q = StringRecord>(path: string, options: { query?: Q } = {}): Promise<T> {
    return this.make<T, never, Q>({ path, method: 'get', ...options });
  }

  /**
   * Makes a DELETE request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public delete<T, D = RequestBodyData>(path: string, options: { data?: D; reason?: string } = {}): Promise<T> {
    return this.make<T, D, never>({ path, method: 'delete', ...options });
  }

  /**
   * Makes a PATCH request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public patch<T, D = RequestBodyData>(path: string, options: { data: D; reason?: string }): Promise<T> {
    return this.make<T, D, never>({ path, method: 'patch', ...options });
  }

  /**
   * Makes a PUT request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public put<T, D = RequestBodyData>(path: string, options?: { data?: D; reason?: string }): Promise<T> {
    return this.make<T, D, never>({ path, method: 'put', ...options });
  }

  /**
   * Makes a POST request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public post<T, D = RequestBodyData, Q = StringRecord>(path: string, options: { data: D; reason?: string; files?: File[]; query?: Q }): Promise<T> {
    return this.make<T, D, Q>({ path, method: 'post', ...options });
  }
}

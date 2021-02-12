import { Bucket, RatelimitData } from './Bucket';
import { USER_AGENT } from './Constants';
import { EventEmitter } from 'events';
import { Headers } from 'node-fetch';
import { Mutex, MemoryMutex } from './mutex';
import AbortController from 'abort-controller';
import type { DiscordFetchOptions, AnyRecord } from './Fetch';

export interface RestManagerOptions {
  /**
   * How many times to retry making a request before giving up
   */
  retries: number;
  /**
   * By default, how long to wait before timing out on a request
   */
  abortAfter: number;
  /**
   * Mutex implementation to use for rate limiting
   */
  mutex: Mutex;
}

export interface RestManager {
  on(event: 'request', listener: (request: Partial<DiscordFetchOptions>) => any): this;
  on(
    event: 'response',
    listener: (request: Partial<DiscordFetchOptions>, response: any, ratelimit: Partial<RatelimitData>) => any
  ): this;
  on(event: 'ratelimit', listener: (bucket: string, endpoint: string, waitingFor: number) => any): this;

  once(event: 'request', listener: (request: Partial<DiscordFetchOptions>) => any): this;
  once(
    event: 'response',
    listener: (request: Partial<DiscordFetchOptions>, response: any, ratelimit: Partial<RatelimitData>) => any
  ): this;
  once(event: 'ratelimit', listener: (bucket: string, endpoint: string, waitingFor: number) => any): this;

  emit(event: 'request', request: Partial<DiscordFetchOptions>): boolean;
  emit(
    event: 'response',
    request: Partial<DiscordFetchOptions>,
    response: any,
    ratelimit: Partial<RatelimitData>
  ): boolean;
  emit(event: 'ratelimit', bucket: string, endpoint: string, waitingFor: number): boolean;
}

export interface RequestOptions<D extends AnyRecord, Q extends AnyRecord> {
  path: string;
  method: string;
  headers?: Headers;
  controller?: AbortController;
  query?: Q | string;
  reason?: string;
  files?: { name: string; file: Buffer }[];
  data?: D;
}

export type KnownMethodRequestOptions<D extends AnyRecord, Q extends AnyRecord> = Omit<RequestOptions<D, Q>, 'path' | 'method'>;

export class RestManager extends EventEmitter {
  /**
   * Current active rate limiting Buckets
   */
  private readonly _buckets = new Map<string, Bucket>();

  public readonly retries: number;
  public readonly abortAfter: number;
  public readonly mutex: Mutex;

  /**
   * @param auth Your bot's Discord token
   * @param options Options for the REST manager
   */
  public constructor(
    public readonly auth: string,
    options: Partial<RestManagerOptions> = {}
  ) {
    super();
    const {
      retries = 3,
      abortAfter = 15e3,
      mutex = new MemoryMutex()
    } = options;

    this.retries = retries;
    this.abortAfter = abortAfter;
    this.mutex = mutex;
  }

  /**
   * Prepares a request to Discord, associating it to the correct Bucket and attempting to prevent rate limits
   * @param options Options needed for making a request; only the path is required
   */
  public make<T, D extends AnyRecord = AnyRecord, Q extends AnyRecord = AnyRecord>(options: RequestOptions<D, Q>): Promise<T> {
    const route = Bucket.makeRoute(options.method, options.path);

    let bucket = this._buckets.get(route);

    if (!bucket) {
      bucket = new Bucket(this, route);
      this._buckets.set(route, bucket);
    }

    options.controller ??= new AbortController();

    options.headers ??= new Headers();
    options.headers.set('Authorization', `Bot ${this.auth}`);
    options.headers.set('User-Agent', USER_AGENT);

    return bucket.make<T, D, Q>(options as DiscordFetchOptions<D, Q>);
  }

  /**
   * Makes a GET request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public get<T, Q extends AnyRecord = AnyRecord>(
    path: string,
    options?: KnownMethodRequestOptions<never, Q>
  ): Promise<T> {
    return this.make<T, never, Q>({
      path,
      method: 'get',
      ...options
    });
  }

  /**
   * Makes a DELETE request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public delete<T, Q extends AnyRecord = AnyRecord>(
    path: string,
    options?: KnownMethodRequestOptions<never, Q>
  ): Promise<T> {
    return this.make<T, never, Q>({
      path,
      method: 'delete',
      ...options
    });
  }

  /**
   * Makes a PUT request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public put<T, D extends AnyRecord = AnyRecord, Q extends AnyRecord = AnyRecord>(
    path: string,
    options: KnownMethodRequestOptions<D, Q> & { data: D }
  ): Promise<T> {
    return this.make<T, D, Q>({
      path,
      method: 'put',
      ...options
    });
  }

  /**
   * Makes a POST request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public post<T, D extends AnyRecord = AnyRecord, Q extends AnyRecord = AnyRecord>(
    path: string,
    options: KnownMethodRequestOptions<D, Q> & { data: D }
  ): Promise<T> {
    return this.make<T, D, Q>({
      path,
      method: 'post',
      ...options
    });
  }

  /**
   * Makes a PATCH request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  /* istanbul ignore next */
  public patch<T, D extends AnyRecord = AnyRecord, Q extends AnyRecord = AnyRecord>(
    path: string,
    options: KnownMethodRequestOptions<D, Q> & { data: D }
  ): Promise<T> {
    return this.make<T, D, Q>({
      path,
      method: 'patch',
      ...options
    });
  }
}

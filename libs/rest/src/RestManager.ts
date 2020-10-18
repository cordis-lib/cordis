import { RequestBuilderOptions } from './Fetch';
import { Bucket, RatelimitData } from './Bucket';
import { userAgent } from './Constants';
import { EventEmitter } from 'events';
import { Headers } from 'node-fetch';
import { ENDPOINTS } from '@cordis/util';

export interface RestManagerOptions {
  /**
   * How many times to retry making a request before giving up
   */
  retries: number;
  /**
   * How long to wait before timing out on a request
   */
  abortIn: number;
  /**
   * What version of the api to use
   */
  apiVersion: number;
}

export interface RestManager {
  on(event: 'request', listener: (request: Partial<RequestBuilderOptions>) => any): this;
  on(
    event: 'response',
    listener: (request: Partial<RequestBuilderOptions>, response: any, ratelimit: Partial<RatelimitData>) => any
  ): this;
  on(event: 'ratelimit', listener: (bucket: string, endpoint: string, prevented: boolean, waitingFor: number) => any): this;

  once(event: 'request', listener: (request: Partial<RequestBuilderOptions>) => any): this;
  once(
    event: 'response',
    listener: (request: Partial<RequestBuilderOptions>, response: any, ratelimit: Partial<RatelimitData>) => any
  ): this;
  once(event: 'ratelimit', listener: (bucket: string, endpoint: string, prevented: boolean, waitingFor: number) => any): this;

  emit(event: 'request', request: Partial<RequestBuilderOptions>): boolean;
  emit(
    event: 'response',
    request: Partial<RequestBuilderOptions>,
    response: any,
    ratelimit: Partial<RatelimitData>
  ): boolean;
  emit(event: 'ratelimit', bucket: string, endpoint: string, prevented: boolean, waitingFor: number): boolean;
}

export class RestManager extends EventEmitter implements RestManagerOptions {
  public readonly retries: number;
  public readonly abortIn: number;
  public readonly apiVersion: number;

  /**
   * Current active rate limiting Buckets
   */
  private readonly _buckets = new Map<string, Bucket>();

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
      abortIn = 60 * 1000,
      apiVersion = 8
    } = options;

    this.retries = retries;
    this.abortIn = abortIn;
    this.apiVersion = apiVersion;
  }

  /**
   * Makes a GET request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  public get(path: string, options: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make({
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
  public delete(path: string, options: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make({
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
  public put(path: string, options: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make({
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
  public post(path: string, options: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make({
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
  public patch(path: string, options: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make({
      path,
      method: 'patch',
      ...options
    });
  }

  /**
   * Makes a request to Discord, associating it to the correct Bucket and attempting to prevent rate limits
   * @param options Options needed for making a request; only the path is required
   */
  public make(options: Partial<RequestBuilderOptions> & { path: string }) {
    options.method = options.method ?? 'get';
    options.api = options.api ?? `${ENDPOINTS.api}/v${this.apiVersion}`;
    options.abortIn = options.abortIn ?? this.abortIn;

    const route = Bucket.makeRoute(options.method, options.path);

    let bucket = this._buckets.get(route);

    if (!bucket) {
      bucket = new Bucket(this, route);
      this._buckets.set(route, bucket);
    }

    if (!options.headers) options.headers = new Headers();

    options.headers.set('Authorization', `Bot ${this.auth}`);
    options.headers.set('User-Agent', userAgent);

    return bucket.make(options as RequestBuilderOptions);
  }
}

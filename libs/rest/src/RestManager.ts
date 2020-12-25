import { RequestBuilderOptions } from './Fetch';
import { Bucket, RatelimitData } from './Bucket';
import { userAgent } from './Constants';
import { EventEmitter } from 'events';
import { Headers } from 'node-fetch';
import { Bag, ENDPOINTS, Store } from '@cordis/util';

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
  /**
   * Method that can be called to get a store to use to keep track of rate limits
   */
  store: (name: string) => Store<Partial<RatelimitData>, boolean, any>;
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

export class RestManager extends EventEmitter {
  public readonly retries: number;
  public readonly abortIn: number;
  public readonly apiVersion: number;
  public readonly store: Store<Partial<RatelimitData>, boolean, any>;

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
      apiVersion = 8,
      store = () => new Bag()
    } = options;

    this.retries = retries;
    this.abortIn = abortIn;
    this.apiVersion = apiVersion;
    this.store = store('cordis_rest_ratelimit');
  }

  /**
   * Makes a GET request to the given endpoint
   * @param path The request target
   * @param options Other options for the request
   */
  public get<T, D = Record<any, any>, Q = Record<any, any>>(
    path: string,
    options?: Partial<Omit<RequestBuilderOptions<D, Q>, 'path' | 'method'>>
  ) {
    return this.make<T, D, Q>({
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
  public delete<T, D = Record<any, any>, Q = Record<any, any>>(
    path: string,
    options?: Partial<Omit<RequestBuilderOptions<D, Q>, 'path' | 'method'>>
  ) {
    return this.make<T, D, Q>({
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
  public put<T, D = Record<any, any>, Q = Record<any, any>>(
    path: string,
    options?: Partial<Omit<RequestBuilderOptions<D, Q>, 'path' | 'method'>>
  ) {
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
  public post<T, D = Record<any, any>, Q = Record<any, any>>(
    path: string,
    options?: Partial<Omit<RequestBuilderOptions<D, Q>, 'path' | 'method'>>
  ) {
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
  public patch<T, D = Record<any, any>, Q = Record<any, any>>(
    path: string,
    options?: Partial<Omit<RequestBuilderOptions<D, Q>, 'path' | 'method'>>
  ) {
    return this.make<T, D, Q>({
      path,
      method: 'patch',
      ...options
    });
  }

  /**
   * Makes a request to Discord, associating it to the correct Bucket and attempting to prevent rate limits
   * @param options Options needed for making a request; only the path is required
   */
  public make<T, D = Record<any, any>, Q = Record<any, any>>(options: Partial<RequestBuilderOptions<D>> & { path: string }): Promise<T> {
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

    return bucket.make<T, D, Q>(options as RequestBuilderOptions<D>);
  }
}

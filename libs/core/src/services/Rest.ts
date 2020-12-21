import { RpcClient } from '@cordis/brokers';
import { RequestBuilderOptions } from '@cordis/rest';
import * as amqp from 'amqplib';
import { CORDIS_AMQP_SYMBOLS } from '../../../rest/node_modules/@cordis/util/types';

// TODO: Cleanup
export class Rest {
  public service: RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>;

  public constructor(channel: amqp.Channel) {
    this.service = new RpcClient(channel);
  }

  public get<T>(path: string, options?: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make<T>({
      path,
      method: 'get',
      ...options
    });
  }

  public delete<T>(path: string, options?: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make<T>({
      path,
      method: 'delete',
      ...options
    });
  }

  public put<T>(path: string, options?: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make<T>({
      path,
      method: 'put',
      ...options
    });
  }

  public post<T>(path: string, options?: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make<T>({
      path,
      method: 'post',
      ...options
    });
  }

  public patch<T>(path: string, options?: Partial<Omit<RequestBuilderOptions, 'path' | 'method'>>) {
    return this.make<T>({
      path,
      method: 'patch',
      ...options
    });
  }

  public make<T>(options: Partial<RequestBuilderOptions> & { path: string }): Promise<T> {
    return this.service.post(options) as Promise<unknown> as Promise<T>;
  }

  public init() {
    return this.service.init(CORDIS_AMQP_SYMBOLS.rest.queue);
  }
}

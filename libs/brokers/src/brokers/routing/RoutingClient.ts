import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

export interface RoutingClientInitOtions {
  name: string;
  topicBased?: boolean;
  keys: string[];
  queue?: string;
}

// ? Have to retype the error events as a hack, unfortunately
export interface RoutingClient<K extends string, T extends Record<K, any>> extends Broker {
  on(event: 'error', listener: (error: any) => any): this;
  on<LK extends K>(event: LK, listener: (data: T[LK]) => any): this;

  once(event: 'error', listener: (error: any) => any): this;
  once<LK extends K>(event: LK, listener: (data: T[LK]) => any): this;

  emit(event: 'error', error: any): boolean;
  emit<LK extends K>(event: LK, data: T[LK]): boolean;
}

export class RoutingClient<K extends string, T extends Record<K, any>> extends Broker {
  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /* istanbul ignore next */
  public async init({ name, topicBased = false, keys, queue = '' }: RoutingClientInitOtions) {
    const exchange = await this.channel.assertExchange(name, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);

    const data = await this.channel.assertQueue(queue, { durable: true, exclusive: queue === '' });
    queue = data.queue;

    for (const key of keys) await this.channel.bindExchange(queue, exchange, key);

    await this.util.consumeQueue({
      queue,
      cb: (content: { type: K; data: T[K] }) => this.emit(content.type, content.data),
      noAck: true
    });
  }
}

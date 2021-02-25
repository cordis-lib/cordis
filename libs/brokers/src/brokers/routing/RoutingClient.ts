import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

/**
 * Options for initializing the routing client
 */
export interface RoutingClientInitOtions<K extends string> {
  /**
   * Name of the exchange to use
   */
  name: string;
  /**
   * Wether or not this broker should be using a topic or a direct exchange
   */
  topicBased?: boolean;
  /**
   * The routing keys you wish to subscribe to
   */
  keys: K[];
  /**
   * Queue to bind the packets to
   * @default queue Randomly generated queue by your AMQP server
   */
  queue?: string;
}

export interface RoutingClient<K extends string, T extends Record<K, any>> extends Broker {
  /**
   * Event used mostly for internal errors
   * @event
   */
  on(event: 'error', listener: (error: any) => any): this;
  /**
   * All the events you've subscribed to
   * @event
   */
  on<LK extends K>(event: LK, listener: (data: T[LK]) => any): this;

  /** @internal */
  once(event: 'error', listener: (error: any) => any): this;
  /** @internal */
  once<LK extends K>(event: LK, listener: (data: T[LK]) => any): this;

  /** @internal */
  emit(event: 'error', error: any): boolean;
  /** @internal */
  emit<LK extends K>(event: LK, data: T[LK]): boolean;
}

/**
 * Client-side broker for routing packets using keys
 */
export class RoutingClient<K extends string, T extends Record<K, any>> extends Broker {
  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /**
   * Initializes the client, binding the events you want to the queue
   * @param options Options used for this client
   */
  public async init(options: RoutingClientInitOtions<K>) {
    const { name, topicBased = false, keys, queue: rawQueue = '' } = options;

    const exchange = await this.channel.assertExchange(name, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);
    const queue = await this.channel.assertQueue(rawQueue, { durable: true, exclusive: rawQueue === '' }).then(data => data.queue);

    for (const key of keys) await this.channel.bindExchange(queue, exchange, key);

    await this.util.consumeQueue({
      queue,
      cb: (content: { type: K; data: T[K] }) => this.emit(content.type, content.data),
      autoAck: true
    });
  }
}

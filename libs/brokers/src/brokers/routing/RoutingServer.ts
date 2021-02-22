import { Broker } from '../Broker';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

/**
 * Options for initializing the routing server
 */
export interface RoutingServerInitOptions {
  /**
   * Name of the exchange to use
   */
  name: string;
  /**
   * Wether or not this broker should be using a topic or a direct exchange
   */
  topicBased?: boolean;
}

/**
 * Server-side broker for routing packets using keys
 */
export class RoutingServer<K extends string, T extends Record<K, any>> extends Broker {
  /**
   * Exchange being used
   */
  public exchange?: string;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /**
   * Initializes the server
   * @param options Options used for this server
   */
  public async init(options: RoutingServerInitOptions) {
    this.exchange = await this.channel
      .assertExchange(options.name, options.topicBased ? 'topic' : 'direct', { durable: false })
      .then(d => d.exchange);
  }

  /**
   * Publishes a message under the given key
   * @param key Event you're publishing
   * @param content Data to publish
   * @param options Message-specific options
   */
  public publish<LK extends K>(key: LK, content: T[LK], options?: amqp.Options.Publish) {
    if (!this.exchange) throw new CordisBrokerError('brokerNotInit');

    return this.util.sendToExchange({
      to: this.exchange,
      content: { type: key, data: content },
      key,
      options
    });
  }
}

import { CordisBrokerError } from '../../error';
import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

/**
 * Options for initializing the pub/sub server
 */
export interface PubSubServerInitOptions {
  /**
   * Name of the queue/exchange to use
   */
  name: string;
  /**
   * Wether or not a fanout exchange are being used (multiple subs)
   */
  fanout?: boolean;
}

/**
 * Server for simple publish/subscribe lasyout
 */
export class PubSubServer<T> extends Broker {
  public name?: string;
  public fanout?: boolean;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /**
   * Initializes the client, making it ready to publish packets
   * @param options Options to use for the server
   */
  public async init(options: PubSubServerInitOptions) {
    const { name, fanout = false } = options;

    this.name = fanout
      ? await this.channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
      : await this.channel.assertQueue(name, { durable: true }).then(d => d.queue);

    this.fanout = fanout;
  }

  /**
   * Publishes a message
   * @param content The data to publish
   * @param options Message specific options
   */
  public publish(content: T, options?: amqp.Options.Publish) {
    if (!this.name) throw new CordisBrokerError('brokerNotInit');
    return this.fanout
      ? this.util.sendToExchange({ to: this.name, content, key: '', options })
      : this.util.sendToQueue({ to: this.name, content, options });
  }
}

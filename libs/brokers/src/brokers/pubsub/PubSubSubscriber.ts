import { Broker } from '../Broker';
import type { ConsumeQueueCallback } from '../BrokerUtil';
import type * as amqp from 'amqplib';

/**
 * Options for initializing the pub/sub consumer
 */
export interface PubSubSubscriberInitOptions<T> {
  /**
   * Name of the queue/exchange to use
   */
  name: string;
  /**
   * Wether or not a fanout exchange are being used (multiple subs)
   */
  fanout?: boolean;
  /**
   * Callback to run on every packet
   */
  cb: ConsumeQueueCallback<T>;
}

/**
 * Consumer for simple publish/subscribe layout
 */
export class PubSubSubscriber<T> extends Broker {
  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /**
   * Initializes the server, making it listen to incoming packets
   * @param options Options to use for the client
   */
  public async init(options: PubSubSubscriberInitOptions<T>) {
    const { fanout = false, cb } = options;

    const name = fanout
      ? await this.channel.assertExchange(options.name, 'fanout', { durable: true }).then(d => d.exchange)
      : await this.channel.assertQueue(options.name, { durable: true }).then(d => d.queue);

    const queue = fanout ? await this.channel.assertQueue('', { exclusive: true }).then(d => d.queue) : name;
    if (fanout) {
      await this.channel.bindQueue(queue, name, '');
    }

    await this.util.consumeQueue({
      queue,
      cb,
      autoAck: true
    });
  }
}

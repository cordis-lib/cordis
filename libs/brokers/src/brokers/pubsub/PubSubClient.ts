import { Broker } from '../Broker';
import * as amqp from 'amqplib';

export class PubSubClient<S> extends Broker {
  public queueOrExchange?: string;
  public fanout?: boolean;

  public async init(
    name: string,
    fanout = false,
    cb: (content?: S, properties?: amqp.MessageProperties, original?: amqp.Message) => any
  ) {
    this.queueOrExchange = (
      fanout
        ? await this.channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
        : await this.channel.assertQueue(name, { durable: true }).then(d => d.queue)
    );

    this.fanout = fanout;

    const queue = fanout ? await this.channel.assertQueue('', { exclusive: true }).then(d => d.queue) : name;
    if (fanout) await this.channel.bindQueue(queue, name, '');

    await this._consumeQueue(name, cb, true);
  }
}

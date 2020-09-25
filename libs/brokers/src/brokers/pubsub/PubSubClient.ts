import { CordisBrokerError } from '../../error';
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
    await super.init();

    if (!this.queueOrExchange) throw new CordisBrokerError('brokerNotInit');

    const channel = this.channel!;

    this.queueOrExchange = (
      fanout
        ? await channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
        : await channel.assertQueue(name, { durable: true }).then(d => d.queue)
    );

    this.fanout = fanout;

    const queue = fanout ? await channel.assertQueue('', { exclusive: true }).then(d => d.queue) : name;
    if (fanout) await channel.bindQueue(queue, name, '');

    await this._consumeQueue(name, cb, true);
  }
}

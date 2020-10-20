import { CordisBrokerError } from '../../error';
import { Broker } from '../Broker';
import * as amqp from 'amqplib';

export class PubSubServer<S> extends Broker {
  public queueOrExchange?: string;
  public fanout?: boolean;

  public async init(name: string, fanout = false) {
    const channel = this.channel;

    this.queueOrExchange = (
      fanout
        ? await channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
        : await channel.assertQueue(name, { durable: true }).then(d => d.queue)
    );

    this.fanout = fanout;
  }

  public publish(content: S, options?: amqp.Options.Publish) {
    if (!this.queueOrExchange) throw new CordisBrokerError('brokerNotInit');

    const data = Buffer.from(JSON.stringify(content));

    return (
      this.fanout
        ? this._publishToExchange(this.queueOrExchange, data, '', options)
        : this._sendToQueue(this.queueOrExchange, data, options)
    );
  }
}

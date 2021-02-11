import { CordisBrokerError } from '../../error';
import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

export interface PubSubServerInitOptions {
  name: string;
  fanout?: boolean;
}

export class PubSubServer<T> extends Broker {
  public name?: string;
  public fanout?: boolean;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  public async init({ name, fanout = false }: PubSubServerInitOptions) {
    this.name = fanout
      ? await this.channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
      : await this.channel.assertQueue(name, { durable: true }).then(d => d.queue);

    this.fanout = fanout;
  }

  public publish(content: T, options?: amqp.Options.Publish) {
    if (!this.name) throw new CordisBrokerError('brokerNotInit');
    return this.fanout
      ? this.util.sendToExchange({ to: this.name, content, key: '', options })
      : this.util.sendToQueue({ to: this.name, content, options });
  }
}

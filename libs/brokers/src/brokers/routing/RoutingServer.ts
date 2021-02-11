import { Broker } from '../Broker';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

export interface RoutingServerInitOptions {
  name: string;
  topicBased?: boolean;
}

export class RoutingServer<K extends string, T extends Record<K, any>> extends Broker {
  public exchange?: string;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  public async init({ name, topicBased = false }: RoutingServerInitOptions) {
    this.exchange = await this.channel.assertExchange(name, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);
  }

  public publish<LK extends K>(content: T[LK], key: LK, options?: amqp.Options.Publish) {
    if (!this.exchange) throw new CordisBrokerError('brokerNotInit');

    return this.util.sendToExchange({
      to: this.exchange,
      content: { type: key, data: content },
      key,
      options
    });
  }
}

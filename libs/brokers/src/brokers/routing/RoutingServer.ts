import { Broker } from '../Broker';
import * as amqp from 'amqplib';
import { CordisBrokerError } from '../../error';

export class RoutingServer<K extends string, S extends Record<K, any>> extends Broker {
  public exchange?: string;
  public topicBased?: boolean;

  public async init(exchange: string, topicBased = false) {
    this.topicBased = topicBased;
    this.exchange = await this.channel.assertExchange(exchange, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);
  }

  public publish(content: S[K], key: K, options?: amqp.Options.Publish) {
    if (!this.exchange) throw new CordisBrokerError('brokerNotInit');
    return this._publishToExchange(this.exchange, { type: key, data: content }, key, options);
  }
}

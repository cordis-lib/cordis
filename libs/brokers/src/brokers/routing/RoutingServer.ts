import { Broker } from '../Broker';
import * as amqp from 'amqplib';
import { CordisBrokerError } from '../../error';

export class RoutingServer<S> extends Broker {
  public exchange?: string;
  public topicBased?: boolean;

  public async init(exchange: string, topicBased = false) {
    await super.init();

    this.topicBased = topicBased;
    this.exchange = await this.channel!.assertExchange(exchange, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);
  }

  public publish(content: S, key: string, options?: amqp.Options.Publish) {
    if (!this.exchange) throw new CordisBrokerError('brokerNotInit');
    return this._publishToExchange(this.exchange, content, key, options);
  }
}

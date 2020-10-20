import { Broker } from '../Broker';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';
import { CordisBrokerTypeError } from '../../error';

export class RoutingClient<S> extends Broker {
  public exchange?: string;
  public topicBased?: boolean;
  public redis?: Redis;

  public constructor(channel: amqp.Channel, redis?: Redis) {
    super(channel);
    this.redis = redis;
  }

  public async init(
    exchange: string,
    keys: string | string[],
    topicBased = false,
    balance = false
  ) {
    if (balance && !this.redis) {
      process.emitWarning(new CordisBrokerTypeError('invalidBalance'));
      balance = false;
    }

    keys = [...new Set(Array.isArray(keys) ? keys : [keys])].sort();
    const identifier = keys.map(e => e.toUpperCase()).join('-');

    this.topicBased = topicBased;
    this.exchange = await this.channel.assertExchange(exchange, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);

    const intendedQueueName = balance ? (await this.redis!.hget(`${this.exchange}_queues`, identifier) ?? '') : '';
    const { queue } = await this.channel.assertQueue(intendedQueueName, { durable: true, exclusive: !balance });

    if (balance && intendedQueueName === '') await this.redis!.hset(`${this.exchange}_queues`, identifier, queue);

    for (const key of keys) await this.channel.bindExchange(queue, this.exchange, key);

    await this._consumeQueue(queue, (content: { type: string; data: S }) => void this.emit(content.type, content.data));
  }
}

import { Broker } from '../Broker';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';
import { CordisBrokerTypeError } from '../../error';
import { CORDIS_REDIS_SYMBOLS } from '@cordis/util';

export interface RoutingClient<K extends string, S extends Record<K, any>> {
  on(event: K, listener: (data: S[K]) => any): this;
  once(event: K, listener: (data: S[K]) => any): this;
  emit(event: K, data: S[K]): boolean;
}

export class RoutingClient<K extends string, S extends Record<K, any>> extends Broker {
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

    const intendedQueueName = balance
      ? (await this.redis!.hget(CORDIS_REDIS_SYMBOLS.internal.amqp.queues(this.exchange), identifier) ?? '')
      : '';
    const { queue } = await this.channel.assertQueue(intendedQueueName, { durable: true, exclusive: !balance });

    if (balance && intendedQueueName === '') {
      await this.redis!.hset(CORDIS_REDIS_SYMBOLS.internal.amqp.queues(this.exchange), identifier, queue);
    }

    for (const key of keys) await this.channel.bindExchange(queue, this.exchange, key);

    await this._consumeQueue(queue, (content: { type: K; data: S[K] }) => this.emit(content.type, content.data), false);
  }
}

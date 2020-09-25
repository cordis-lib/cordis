import { Broker } from '../Broker';
import { Redis } from 'ioredis';
import { CordisBrokerTypeError } from '../../error';

export class RoutingClient<S> extends Broker {
  public exchange?: string;
  public topicBased?: boolean;
  public redis?: Redis;

  public constructor(host: string, redis?: Redis) {
    super(host);
    this.redis = redis;
  }

  public async init(
    exchange: string,
    key: string,
    topicBased = false,
    balance = false
  ) {
    await super.init();

    if (balance && !this.redis) {
      process.emitWarning(new CordisBrokerTypeError('invalidBalance'));
      balance = false;
    }

    this.topicBased = topicBased;
    this.exchange = await this.channel!.assertExchange(exchange, topicBased ? 'topic' : 'direct', { durable: false }).then(d => d.exchange);

    const intendedQueueName = balance ? (await this.redis!.hget(`${this.exchange}_queues`, key) ?? '') : '';
    const { queue } = await this.channel!.assertQueue(intendedQueueName, { durable: true, exclusive: !balance });

    if (balance && intendedQueueName === '') await this.redis!.hset(`${this.exchange}_queues`, key, queue);

    await this._consumeQueue(queue, (content: { type: string; data: S }) => void this.emit(content.type, content.data));
  }
}

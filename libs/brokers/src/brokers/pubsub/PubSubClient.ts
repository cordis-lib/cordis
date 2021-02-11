import { Broker } from '../Broker';
import type { ConsumeQueueCallback } from '../BrokerUtil';
import type * as amqp from 'amqplib';

export interface PubSubClientInitOptions<T> {
  name: string;
  fanout?: boolean;
  cb: ConsumeQueueCallback<T>;
}

export class PubSubClient<T> extends Broker {
  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  public async init({ name, fanout = false, cb }: PubSubClientInitOptions<T>) {
    name = fanout
      ? await this.channel.assertExchange(name, 'fanout', { durable: true }).then(d => d.exchange)
      : await this.channel.assertQueue(name, { durable: true }).then(d => d.queue);

    const queue = fanout ? await this.channel.assertQueue('', { exclusive: true }).then(d => d.queue) : name;
    if (fanout) await this.channel.bindQueue(queue, name, '');

    await this.util.consumeQueue({
      queue,
      cb,
      noAck: true
    });
  }
}

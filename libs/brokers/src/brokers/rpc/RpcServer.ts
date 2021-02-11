import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

export interface RpcServerInitOptions<S, C> {
  name: string;
  cb: (content: C) => S | Promise<S>;
}

export class RpcServer<S, C> extends Broker {
  public serverQueue?: string;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  public async init({ name, cb }: RpcServerInitOptions<S, C>) {
    this.serverQueue = await this.channel.assertQueue(name, { durable: false }).then(d => d.queue);

    await this.channel.prefetch(1);

    await this.util.consumeQueue({
      queue: this.serverQueue,
      cb: async (content: C, msg) => {
        let value: S | null;
        let error: boolean;

        try {
          value = await cb(content);
          error = false;
        } catch (e) {
          this.emit('error', e);
          value = null;
          error = true;
        }

        this.util.reply(msg, { value, error });
      },
      noAck: true
    });
  }
}

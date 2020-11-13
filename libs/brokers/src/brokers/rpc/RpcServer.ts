import { Broker } from '../Broker';

export class RpcServer<S, C> extends Broker {
  public serverQueue?: string;

  public async init(serverQueue: string, cb: (content: C) => S | Promise<S>) {
    this.serverQueue = await this.channel.assertQueue(serverQueue, { durable: false }).then(d => d.queue);

    await this.channel.prefetch(1);
    await this._consumeQueue(this.serverQueue, async (content: C, properties) => {
      let reply: S;
      let isError: boolean;

      try {
        reply = await cb(content);
        isError = false;
      } catch (e) {
        this.emit('error', e);
        reply = e.message ?? e.toString();
        isError = true;
      }

      this._replyToMsg(properties, reply, isError);
    }, false);
  }
}

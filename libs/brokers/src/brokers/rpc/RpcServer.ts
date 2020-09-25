import { Broker } from '../Broker';

export class RpcServer<S, C> extends Broker {
  public serverQueue?: string;

  public async init(serverQueue: string, cb: (content: C) => S | Promise<S>) {
    await super.init();

    const channel = this.channel!;

    serverQueue = this.serverQueue = await channel.assertQueue(serverQueue, { durable: false }).then(d => d.queue);

    await channel.prefetch(1);
    await this._consumeQueue(this.serverQueue, async (content: C, properties) => {
      let reply: S;
      let isError: boolean;

      try {
        reply = await cb(content);
        isError = false;
      } catch (e) {
        reply = e;
        isError = true;
      }

      this._replyToMsg(properties, reply, isError);
    }, false);
  }
}

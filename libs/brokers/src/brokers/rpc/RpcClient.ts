import { CordisBrokerError } from '../../error';
import { Broker } from '../Broker';

export class RpcClient<S, C> extends Broker {
  public static readonly timeoutAfter = 1e4;

  public serverQueue?: string;
  public replyQueue?: string;

  public async init(serverQueue: string) {
    const channel = this.channel;
    this.serverQueue = await channel.assertQueue(serverQueue, { durable: false }).then(d => d.queue);

    const replyQueue = this.replyQueue = await channel.assertQueue('', { exclusive: true }).then(d => d.queue);

    await this._consumeQueue(replyQueue, (content: { res: S | null; error: string | null }, properties) => {
      if (properties.correlationId) this.emit(`__${properties.correlationId}`, content.res ?? content.error, content.res === null);
    }, true);
  }

  public post(packet: C) {
    return new Promise<S>((resolve, reject) => {
      if (!this.serverQueue) return reject(new CordisBrokerError('brokerNotInit'));

      const correlationId = this._generateCorrelation();

      const cb = (res: S | string, isError: boolean) => {
        clearTimeout(timeout);
        if (isError) return reject(res);
        return resolve(res as S);
      };

      const timeout = setTimeout(
        () => {
          reject(new CordisBrokerError('noResponseInTime', RpcClient.timeoutAfter));
          this.off(`__${correlationId}`, cb);
        },
        RpcClient.timeoutAfter
      );

      this.once(`__${correlationId}`, cb);

      this._sendToQueue(this.serverQueue, packet, {
        replyTo: this.replyQueue,
        correlationId
      });
    });
  }
}

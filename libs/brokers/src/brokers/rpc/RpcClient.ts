import { Broker } from '../Broker';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

export interface RpcClientInitOptions {
  name: string;
  timeout?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface RpcClient<S, C> extends Broker {
  on(event: 'error', listener: (error: any) => any): this;
  on(event: `__${string}`, listener: (data: S, isError: false) => any | ((data: null, isError: true) => any)): this;

  once(event: 'error', listener: (error: any) => any): this;
  once(event: `__${string}`, listener: (data: S, isError: false) => any | ((data: null, isError: true) => any)): this;

  emit(event: 'error', error: any): boolean;
  emit(event: `__${string}`, data: S, isError: false): boolean;
  emit(event: `__${string}`, data: null, isError: true): boolean;
}

export class RpcClient<S, C> extends Broker {
  public serverQueue?: string;
  public replyQueue?: string;
  public timeout?: number;

  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  public async init({ name, timeout = 1e4 }: RpcClientInitOptions) {
    this.serverQueue = await this.channel.assertQueue(name, { durable: false }).then(d => d.queue);
    this.replyQueue = await this.channel.assertQueue('', { exclusive: true }).then(d => d.queue);
    this.timeout = timeout;

    await this.util.consumeQueue({
      queue: this.replyQueue,
      cb: (content: { value: S; error: false } | { value: null; error: true }, msg) => {
        const key = `__${msg.properties.correlationId as string}` as const;
        /* istanbul ignore else */
        if (msg.properties.correlationId) {
          if (content.value) this.emit(key, content.value, false);
          else this.emit(key, null, true);
        }
      },
      noAck: false
    });
  }

  public post(packet: C) {
    return new Promise<S>((resolve, reject) => {
      if (!this.serverQueue) return reject(new CordisBrokerError('brokerNotInit'));

      const correlationId = this.util.generateCorrelationId();

      const cb = (res: S | null, isError: boolean) => {
        clearTimeout(timeout);
        if (isError) return reject(new CordisBrokerError('serverFailure'));
        return resolve(res as S);
      };

      const timeout = setTimeout(
        () => {
          reject(new CordisBrokerError('noResponseInTime', this.timeout!));
          this.off(`__${correlationId}`, cb);
        },
        this.timeout!
      );

      this.once(`__${correlationId}` as const, cb);

      this.util.sendToQueue({
        to: this.serverQueue,
        content: packet,
        options: {
          replyTo: this.replyQueue,
          correlationId
        }
      });
    });
  }
}

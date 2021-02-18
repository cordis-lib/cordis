import { Broker } from '../Broker';
import type * as amqp from 'amqplib';

/**
 * Callback used for generating a server response from the client-given data
 */
export type RpcServerCallback<C, S> = (content: C) => S | Promise<S>;

/**
 * Options for initializing the RPC server
 */
export interface RpcServerInitOptions<S, C> {
  /**
   * Queue the server should be recieving requests on
   */
  name: string;
  /**
   * The callback to run for each message
   */
  cb: RpcServerCallback<C, S>;
}

/**
 * Server-side broker for a simple RPC layout
 */
export class RpcServer<S, C> extends Broker {
  public constructor(channel: amqp.Channel) {
    super(channel);
  }

  /**
   * Initializes the server, making it listen for packets
   * @param options Options used for this server
   */
  public async init(options: RpcServerInitOptions<S, C>) {
    const { name, cb } = options;

    const queue = await this.channel.assertQueue(name, { durable: false }).then(d => d.queue);

    await this.channel.prefetch(1);

    await this.util.consumeQueue({
      queue,
      cb: async (raw: C, msg) => {
        let content: S | null;
        let error: boolean;

        try {
          content = await cb(raw);
          error = false;
        } catch (e) {
          this.emit('error', e);
          content = null;
          error = true;
        }

        this.util.reply({ msg, content, error });
      },
      autoAck: true
    });
  }
}

import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import { halt, isPromise, getMissingProps } from '@cordis/util';
import { randomBytes } from 'crypto';
import { CordisBrokerError, CordisBrokerTypeError } from '../error';

export class Broker extends EventEmitter {
  public static readonly reconnectTimeout = 5e3;

  private readonly _consumers = new Set<string>();

  public readonly host: string;
  public connection?: amqp.Connection;
  public channel?: amqp.Channel;

  public constructor(host: string);
  public constructor(host: string, connection: amqp.Connection, channel: amqp.Channel);
  public constructor(host = 'localhost', connection?: amqp.Connection, channel?: amqp.Channel) {
    super();
    this.host = host.replace(/amqp?\:?\/?\//g, '');
    this.connection = connection;
    this.channel = channel;
  }

  private readonly _onClose = () => {
    this.emit('close');
    void halt(Broker.reconnectTimeout).then(() => this.init());
  };

  private readonly _onError = (e: any) => this.emit('error', e);

  protected _generateCorrelation(bytes = 32) {
    return randomBytes(bytes).toString('base64');
  }

  protected async _consumeQueue(
    queue: string,
    cb: (content: any, properties: amqp.MessageProperties, original: amqp.Message) => any,
    noAck = false
  ): Promise<amqp.Replies.Consume | void> {
    if (!this.channel) {
      throw new CordisBrokerError('brokerNotInit');
    }

    const data = await this.channel.consume(queue, async msg => {
      if (!msg) return null;

      try {
        const content = JSON.parse(msg.content.toString('utf-8'));
        const res = cb(content, msg.properties, msg);
        if (isPromise(res)) await res;
        if (!noAck) this.channel!.ack(msg);
      } catch (e) {
        this.emit('error', e);
        if (!noAck) this.channel!.reject(msg, false);
      }
    }, { noAck })
      .catch(e => void this.emit(e));

    if (data?.consumerTag) this._consumers.add(data.consumerTag);
  }

  protected _sendToQueue(queue: string, content: any, properties?: Partial<amqp.MessageProperties>) {
    if (!this.channel) {
      throw new CordisBrokerError('brokerNotInit');
    }

    return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), properties);
  }

  protected _publishToExchange(exchange: string, content: any, key = '', options?: amqp.Options.Publish) {
    if (!this.channel) {
      throw new CordisBrokerError('brokerNotInit');
    }

    return this.channel.publish(exchange, key, Buffer.from(JSON.stringify(content)), options);
  }

  protected _replyToMsg(properties: amqp.MessageProperties, reply: any, isError = reply instanceof Error) {
    if (!this.channel) {
      throw new CordisBrokerError('brokerNotInit');
    }

    const missing = getMissingProps(properties, ['correlationId', 'replyTo']);
    if (missing.length) throw new CordisBrokerTypeError('missingProperties', missing);

    return this._sendToQueue(
      properties.replyTo,
      {
        res: isError ? null : reply,
        error: isError ? reply : null
      },
      {
        correlationId: properties.correlationId
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async init(..._args: any[]): Promise<void> {
    let connection: amqp.Connection;

    try {
      connection = this.connection ??= await amqp.connect(`amqp://${this.host}`);
    } catch (e) {
      this.emit('close');
      this.emit('error', e);
      await halt(Broker.reconnectTimeout);
      try {
        await this.channel?.close();
        await this.connection?.close();
      } catch {}

      return this.init();
    }

    connection
      .on('close', this._onClose)
      .on('error', this._onError);

    this.channel ??= await connection.createChannel();
  }

  public async destroy() {
    try {
      if (this.channel) {
        for (const tag of this._consumers) await this.channel.cancel(tag);
        await this.channel.close();
      }

      if (this.connection) {
        this.connection.off('close', this._onClose);
        this.connection.off('error', this._onError);

        await this.connection.close();
      }
    } catch {}

    delete this.connection;
    delete this.channel;
  }
}

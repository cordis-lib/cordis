import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import { isPromise, getMissingProps } from '@cordis/util';
import { randomBytes } from 'crypto';
import { CordisBrokerTypeError } from '../error';

export class Broker extends EventEmitter {
  private readonly _consumers = new Set<string>();

  public constructor(public readonly channel: amqp.Channel) {
    super();
  }

  protected _generateCorrelation(bytes = 32) {
    return randomBytes(bytes).toString('base64');
  }

  protected async _consumeQueue(
    queue: string,
    cb: (content: any, properties: amqp.MessageProperties, original: amqp.Message) => any,
    noAck = false
  ): Promise<amqp.Replies.Consume | void> {
    const messageCb = async (msg: amqp.ConsumeMessage | null) => {
      if (!msg) return null;

      const content = JSON.parse(msg.content.toString('utf-8'));
      const res = cb(content, msg.properties, msg);
      if (isPromise(res)) await res;
      if (!noAck) this.channel.ack(msg);
    };

    const data = await this.channel.consume(
      queue,
      msg => void messageCb(msg).catch(e => {
        this.emit('error', e);
        if (!noAck && msg) this.channel.reject(msg, false);
      }),
      { noAck }
    );

    if (data.consumerTag) this._consumers.add(data.consumerTag);
  }

  protected _sendToQueue(queue: string, content: any, properties?: Partial<amqp.MessageProperties>) {
    return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), properties);
  }

  protected _publishToExchange(exchange: string, content: any, key = '', options?: amqp.Options.Publish) {
    return this.channel.publish(exchange, key, Buffer.from(JSON.stringify(content)), options);
  }

  protected _replyToMsg(properties: amqp.MessageProperties, reply: any, isError = reply instanceof Error) {
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

  public async destroy() {
    try {
      for (const tag of this._consumers) await this.channel.cancel(tag);
    } catch {}
  }
}

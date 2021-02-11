import { randomBytes } from 'crypto';
import { getMissingProps, isPromise } from '@cordis/common';
import { encode, decode } from '@msgpack/msgpack';
import { CordisBrokerTypeError } from '../error';
import type * as amqp from 'amqplib';
import type { Broker } from './Broker';

export type ConsumeQueueCallback<T = any> = (content: T, original: amqp.Message) => any;

export interface ConsumeQueueOptions {
  queue: string;
  cb: ConsumeQueueCallback;
  noAck: boolean;
}

export interface SendOptions {
  to: string;
  content: any;
}

export interface SendToQueueOptions extends SendOptions {
  options?: Partial<amqp.MessageProperties>;
}

export interface SendToExchangeOptions extends SendOptions {
  key: string;
  options?: amqp.Options.Publish;
}

export interface ReplyData<T = any> {
  value: T | null;
  error: boolean;
}

export class BrokerUtil {
  public constructor(
    public readonly broker: Broker
  ) {}

  public generateCorrelationId(bytes = 32) {
    return randomBytes(bytes).toString('base64');
  }

  public async consumeQueue({ queue, cb, noAck }: ConsumeQueueOptions): Promise<amqp.Replies.Consume | void> {
    const messageCb = async (msg: amqp.ConsumeMessage | null) => {
      /* istanbul ignore next */
      if (!msg) return null;

      const content = decode(msg.content);
      const res = cb(content, msg);
      if (isPromise(res)) await res;
      /* istanbul ignore if */
      if (!noAck) this.broker.channel.ack(msg);
    };

    const data = await this.broker.channel.consume(
      queue,
      msg => void messageCb(msg)
        .catch(e => {
          this.broker.emit('error', e);
          /* istanbul ignore else */
          if (!noAck && msg) this.broker.channel.reject(msg, false);
        }),
      { noAck }
    );

    /* istanbul ignore next */
    if (data.consumerTag) {
      this.broker.consumers.add(data.consumerTag);
      return data;
    }
  }

  /* istanbul ignore next */
  public sendToQueue({ to, content, options }: SendToQueueOptions) {
    const encoded = encode(content);
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    return this.broker.channel.sendToQueue(to, data, options);
  }

  /* istanbul ignore next */
  public sendToExchange({ to, content, key, options }: SendToExchangeOptions) {
    const encoded = encode(content);
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    return this.broker.channel.publish(to, key, data, options);
  }

  public reply(msg: amqp.Message, content: ReplyData) {
    const missing = getMissingProps(msg.properties, ['correlationId', 'replyTo']);
    if (missing.length) throw new CordisBrokerTypeError('missingProperties', missing);

    return this.sendToQueue({
      to: msg.properties.replyTo,
      content,
      options: {
        correlationId: msg.properties.correlationId
      }
    });
  }
}

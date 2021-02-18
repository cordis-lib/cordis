import { randomBytes } from 'crypto';
import { getMissingProps } from '@cordis/common';
import { encode, decode } from '@msgpack/msgpack';
import { CordisBrokerTypeError } from '../error';
import type * as amqp from 'amqplib';
import type { Broker } from './Broker';

/**
 * Callback used for consuming a queue
 */
export type ConsumeQueueCallback<T = any> = (content: T, original: amqp.Message) => any;

/**
 * Options for consuming a queue
 */
export interface ConsumeQueueOptions<T = any> {
  /**
   * Queue to consume
   */
  queue: string;
  /**
   * Callback to use for the recieved messages
   */
  cb: ConsumeQueueCallback<T>;
  /**
   * Wether or not messages should be automatically acknowledged
   * WARNING: You are responsible for turning this off. Failing to handle your promises could lead to serious cases your code
   * was probably not written to account, your AMQP server just doing its own thing.
   * No matter what, make sure you use `{@link Broker.channel}.ack` or `{@link Broker.channel}.reject` once you're done processing something
   * You should absolutely acknowledge messages you've successfully eaten and picking your own reject strategies for errors.
   */
  autoAck: boolean;
}

/**
 * Options used to send a message to a queue
 */
export interface SendOptions<T = any> {
  /**
   * The queue you're sending to
   */
  to: string;
  /**
   * The content you're sending
   */
  content: T;
}

/**
 * Options used to send a message to a queue
 */
export interface SendToQueueOptions<T = any> extends SendOptions<T> {
  /**
   * Queue-specific AMQP options
   */
  options?: Partial<amqp.MessageProperties>;
}

/**
 * Options used to send a message to an exchange
 */
export interface SendToExchangeOptions<T = any> extends SendOptions<T> {
  /**
   * Targetted routing key
   */
  key: string;
  /**
   * Exchange-specific AMQP options
   */
  options?: amqp.Options.Publish;
}

/**
 * Data used to reply to a message
 */
export interface ReplyData<T = any> {
  msg: amqp.Message;
  content: T | null;
  error: boolean;
}

/**
 * Class containing utilities for interacting with amqplib
 */
export class BrokerUtil {
  public constructor(
    /**
     * Broker instance
     */
    public readonly broker: Broker
  ) {}

  /**
   * Generates a base64 string with the given length using Node.js' Crypto
   * @param bytes Bytes to use
   * @returns A randomly generated base64 string
   */
  public generateCorrelationId(bytes = 32) {
    return randomBytes(bytes).toString('base64');
  }

  /**
   * Begins consuming a queue and stores the consumer tag for later cancellation
   * @param options Options to use for consuming this queue
   * @returns The consumer tag, if any was created
   */
  public async consumeQueue<T>(options: ConsumeQueueOptions<T>): Promise<string | null> {
    const { queue, cb, autoAck } = options;

    const data = await this.broker.channel.consume(
      queue,
      // Throw callback unhandled errors here and try to reject the message for the end user
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async msg => {
        /* istanbul ignore next */
        if (!msg) return null;
        try {
          await cb(decode(msg.content) as T, msg);
        } catch (e) {
          this.broker.emit('error', e);
          this.broker.channel.reject(msg, true);
        }
      },
      { noAck: autoAck }
    );

    /* istanbul ignore else */
    if (data.consumerTag) {
      this.broker.consumers.add(data.consumerTag);
      return data.consumerTag;
    }

    /* istanbul ignore next */
    return null;
  }

  /**
   * Sends a message to the designated queue
   * @param options Options to use for delivering this message
   */
  /* istanbul ignore next */
  public sendToQueue<T>(options: SendToQueueOptions<T>) {
    const { to, content, options: amqpOptions } = options;

    const encoded = encode(content);
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    return this.broker.channel.sendToQueue(to, data, amqpOptions);
  }

  /**
   * Sends a message to the designated exchange
   * @param options Options to use for delivering this message
   */
  /* istanbul ignore next */
  public sendToExchange<T>(options: SendToExchangeOptions<T>) {
    const { to, content, key, options: amqpOptions } = options;

    const encoded = encode(content);
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    return this.broker.channel.publish(to, key, data, amqpOptions);
  }

  public reply<T>(options: ReplyData<T>) {
    const { msg, ...content } = options;

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

import { Broker } from './Broker';
import { createAmqp } from '../amqp';
import { encode } from '@msgpack/msgpack';
import { CordisBrokerTypeError } from '../error';

jest.mock('crypto', () => {
  const actual: typeof import('crypto') = jest.requireActual('crypto');

  return {
    ...actual,
    randomBytes: jest
      .fn<Buffer, [number]>()
      // @ts-expect-error Mocked buffer isn't a complete buffer.
      .mockImplementation(bytes => {
        if (bytes === 32) {
          return {
            toString: () => 'isl9iE2PJd5/hSwK3T8/3uzqWr5UGwZ9zfyM7Ngb/kQ='
          };
        }

        return actual.randomBytes(bytes);
      })
  };
});

jest.mock('amqplib', () => {
  const actual: typeof import('amqplib') = jest.requireActual('amqplib');

  return {
    ...actual,
    connect: jest
      .fn()
      .mockImplementation(() => {
        const on = jest
          .fn()
          .mockImplementation(() => ({ on }));

        const callbacks: any = {};

        return Promise.resolve({
          on,
          createChannel: jest
            .fn()
            .mockImplementation(() => Promise.resolve({
              consume: jest
                .fn<Promise<{ consumerTag: string }>, [string, (...args: any) => any]>()
                .mockImplementation((queue, cb) => {
                  callbacks[queue] = cb;
                  return Promise.resolve({ consumerTag: 'test' });
                }),
              sendToQueue: jest
                .fn<any, [string, any]>()
                .mockImplementation((queue, data) => callbacks[queue]?.({ content: data })),
              ack: jest.fn(),
              reject: jest.fn()
            }))
        });
      })
  };
});

let broker!: Broker;

beforeEach(async () => {
  const { channel } = await createAmqp({ host: 'boop', onError: console.error, onClose: console.error });
  // @ts-expect-error - Brokers are supposed to be implemented, but for test's sake we're just using the base class
  broker = new Broker(channel);
});

test('generate correlation id', () => {
  expect(broker.util.generateCorrelationId()).toBe('isl9iE2PJd5/hSwK3T8/3uzqWr5UGwZ9zfyM7Ngb/kQ=');
});

describe('consume queue', () => {
  test('ack and no rejections', async () => {
    const cb = jest.fn();

    await broker.util.consumeQueue({
      queue: 'test',
      cb,
      noAck: true
    });

    const encoded = encode('test');
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    broker.channel.sendToQueue('test', data);

    await new Promise(resolve => setImmediate(resolve));

    expect(cb).toHaveBeenCalledWith('test', { content: data });
  });

  test('noack and rejection', async () => {
    const cb = jest.fn().mockImplementation(() => Promise.reject());
    const onError = jest.fn();

    broker.on('error', onError);

    await broker.util.consumeQueue({
      queue: 'test',
      cb,
      noAck: false
    });

    const encoded = encode('test');
    const data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    broker.channel.sendToQueue('test', data);

    await new Promise(resolve => setImmediate(resolve));

    expect(cb).toHaveBeenCalledWith('test', { content: data });
    expect(onError).toHaveBeenCalled();
  });
});

describe('reply', () => {
  test('it should throw with bad parameters', () => {
    // @ts-expect-error - Testing errors
    expect(() => broker.util.reply({ properties: {} })).toThrow(CordisBrokerTypeError);
  });

  test('it should work with proper parameters', () => {
    const mockedMessage: any = { properties: { correlationId: 'test', replyTo: 'test' } };
    expect(() => broker.util.reply(mockedMessage, { value: 'test', error: false })).not.toThrow();
  });
});

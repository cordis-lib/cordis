import { Broker } from './Broker';
import { createAmqp } from '../amqp';
import { encode } from '@msgpack/msgpack';
import { CordisBrokerTypeError } from '../error';

jest.mock('crypto', () => ({
  randomBytes: jest
    .fn<Buffer, [number]>()
    // @ts-expect-error
    .mockImplementation(() => ({
      toString: () => 'isl9iE2PJd5/hSwK3T8/3uzqWr5UGwZ9zfyM7Ngb/kQ='
    }))
}));

jest.mock('amqplib', () => ({
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
}));

let broker!: Broker;

beforeEach(async () => {
  const { channel } = await createAmqp('boop');
  // @ts-expect-error - Brokers are supposed to be implemented, but for test's sake we're just using the base class
  broker = new Broker(channel);
});

test('generate correlation id', () => {
  expect(broker.util.generateCorrelationId()).toBe('isl9iE2PJd5/hSwK3T8/3uzqWr5UGwZ9zfyM7Ngb/kQ=');
});

describe('consume queue', () => {
  test('ack and no rejections', async () => {
    const cb = jest.fn(() => Promise.resolve());

    await broker.util.consumeQueue({
      queue: 'test',
      cb,
      autoAck: true
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
      autoAck: false
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
    expect(() => broker.util.reply({ msg: { properties: {} } })).toThrow(CordisBrokerTypeError);
  });

  test('it should work with proper parameters', () => {
    const mockedMessage: any = { properties: { correlationId: 'test', replyTo: 'test' } };
    expect(() => broker.util.reply({ msg: mockedMessage, content: 'test', error: false })).not.toThrow();
  });
});

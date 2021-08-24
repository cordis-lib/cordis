import { RpcPublisher } from './RpcPublisher';
import { RpcSubscriber } from './RpcSubscriber';
import { createAmqp } from '../../amqp';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

jest.mock('crypto', () => ({
  randomBytes: jest
    .fn<Buffer, [number]>()
    // @ts-expect-error
    .mockImplementation(() => ({
      toString: () => 'test'
    }))
}));

jest.mock('amqplib', () => {
  const { decode }: typeof import('@msgpack/msgpack') = jest.requireActual('@msgpack/msgpack');

  return {
    connect: jest
      .fn()
      .mockImplementation(() => {
        const on = jest
          .fn()
          .mockImplementation(() => ({ on }));

        let clientCb: (msg: amqp.ConsumeMessage | null) => void;
        let serverCb: (msg: amqp.ConsumeMessage | null) => void;

        return Promise.resolve({
          on,
          createChannel: jest
            .fn()
            .mockImplementation(() => Promise.resolve({
              ack: jest.fn(),
              consume: jest
                .fn<Promise<{ consumerTag: string }>, [string, (...args: any) => any]>()
                .mockImplementation((queue, cb) => {
                  if (queue === '') {
                    clientCb = cb;
                  } else {
                    serverCb = cb;
                  }

                  return Promise.resolve({ consumerTag: 'test' });
                }),
              bindQueue: jest.fn(),
              bindExchange: jest.fn(),
              prefetch: jest.fn(),
              reject: jest.fn(),
              sendToQueue: jest
                .fn<any, [string, any]>()
                .mockImplementation(
                  (queue, data) => {
                    const decoded = decode(data);
                    return queue === ''
                      ? clientCb({ content: data, properties: { correlationId: 'test', replyTo: '' } } as any)
                      : decoded !== 'timeout' && serverCb({ content: data, properties: { correlationId: 'test', replyTo: '' } } as any);
                  }
                ),
              assertQueue: jest
                .fn<Promise<{ queue: string }>, [string]>()
                .mockImplementation(queue => Promise.resolve({ queue }))
            }))
        });
      })
  };
});

let client!: RpcPublisher<string, string>;
let server!: RpcSubscriber<string, string>;

beforeEach(async () => {
  const { channel } = await createAmqp('boop');
  client = new RpcPublisher(channel);
  server = new RpcSubscriber(channel);
});

afterEach(() => jest.clearAllMocks());

test('posting without init', async () => {
  await expect(client.post('test'))
    .rejects
    .toThrow(CordisBrokerError);
});

describe('server response/reply', () => {
  test('no errors', async () => {
    const eventCb = jest.fn().mockImplementation(() => 'test');
    const errorCb = jest.fn();

    await client.init({ name: 'test' });
    await server.init({ name: 'test', cb: eventCb });

    server.on('error', errorCb);

    const reply = await client.post('test');

    expect(reply).toBe('test');
    expect(eventCb).toHaveBeenCalled();
    expect(errorCb).not.toHaveBeenCalled();
  });

  test('error handling', async () => {
    const eventCb = jest.fn().mockImplementation(() => Promise.reject('test'));
    const errorCb = jest.fn();

    await client.init({ name: 'test' });
    await server.init({ name: 'test', cb: eventCb });

    server.on('error', errorCb);

    await expect(client.post('test'))
      .rejects
      .toThrow(new CordisBrokerError('serverFailure'));

    expect(eventCb).toHaveBeenCalled();
    expect(errorCb).toHaveBeenCalled();
  });

  test('timeout handling', async () => {
    const eventCb = jest.fn().mockImplementation(() => 'timeout!');
    const errorCb = jest.fn();

    await client.init({ name: 'test', timeout: 100 });
    await server.init({ name: 'test', cb: eventCb });

    server.on('error', errorCb);

    await expect(client.post('timeout'))
      .rejects
      .toThrow(new CordisBrokerError('noResponseInTime', 100));

    expect(eventCb).not.toHaveBeenCalled();
    expect(errorCb).not.toHaveBeenCalled();
  });
});

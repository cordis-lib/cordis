import { RoutingClient } from './RoutingClient';
import { RoutingServer } from './RoutingServer';
import { createAmqp } from '../../amqp';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

jest.mock('amqplib', () => {
  const actual: typeof import('amqplib') = jest.requireActual('amqplib');
  const crypto: typeof import('crypto') = jest.requireActual('crypto');

  return {
    ...actual,
    connect: jest
      .fn()
      .mockImplementation(() => {
        const on = jest
          .fn()
          .mockImplementation(() => ({ on }));

        let callback: (msg: amqp.ConsumeMessage | null) => void;
        const props = { properties: { correlationId: crypto.randomBytes(16).toString('base64'), timestamp: Date.now() } } as any;

        return Promise.resolve({
          on,
          createChannel: jest
            .fn()
            .mockImplementation(() => Promise.resolve({
              consume: jest
                .fn<Promise<{ consumerTag: string }>, [string, (...args: any) => any]>()
                .mockImplementation((_, cb) => {
                  callback = cb;
                  return Promise.resolve({ consumerTag: 'test' });
                }),
              bindQueue: jest.fn(),
              bindExchange: jest.fn(),
              sendToQueue: jest
                .fn<any, [string, any]>()
                .mockImplementation((_, data) => callback({ content: data, ...props })),
              sendToExchange: jest
                .fn<any, [string, any]>()
                .mockImplementation((_, data) => callback({ content: data, ...props })),
              publish: jest
                .fn<any, [string, string, any]>()
                .mockImplementation((_, __, data) => callback({ content: data, ...props })),
              assertQueue: jest
                .fn<Promise<{ queue: string }>, [string]>()
                .mockImplementation(queue => Promise.resolve({ queue })),
              assertExchange: jest
                .fn<Promise<{ exchange: string }>, [string]>()
                .mockImplementation(exchange => Promise.resolve({ exchange }))
            }))
        });
      })
  };
});

interface Data {
  test: string;
}

const eventCb = jest.fn();
let client!: RoutingClient<keyof Data, Data>;
let server!: RoutingServer<keyof Data, Data>;

beforeEach(async () => {
  const { channel } = await createAmqp('boop');
  client = new RoutingClient(channel);
  server = new RoutingServer(channel);
});

afterEach(() => jest.clearAllMocks());

test('publishing without init', () => {
  expect(() => server.publish('test', 'test')).toThrow(CordisBrokerError);
});

describe('publishing', () => {
  test('not topic based', async () => {
    await client.init({
      name: 'test',
      keys: ['test'],
      queue: 'test'
    });

    await server.init({ name: 'test' });

    client.on('test', eventCb);

    server.publish('test', 'test');

    await new Promise(res => setImmediate(res));

    expect(eventCb).toHaveBeenCalled();
  });

  test('topic based', async () => {
    await client.init({
      name: 'test',
      keys: ['test'],
      queue: 'test',
      topicBased: true
    });

    await server.init({ name: 'test', topicBased: true });

    client.on('test', eventCb);

    server.publish('test', 'test');

    await new Promise(res => setImmediate(res));

    expect(eventCb).toHaveBeenCalled();
  });
});

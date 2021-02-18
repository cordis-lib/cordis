import { PubSubClient } from './PubSubClient';
import { PubSubServer } from './PubSubServer';
import { createAmqp } from '../../amqp';
import { CordisBrokerError } from '../../error';
import type * as amqp from 'amqplib';

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

        let callback: (msg: amqp.ConsumeMessage | null) => void;

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
              sendToQueue: jest
                .fn<any, [string, any]>()
                .mockImplementation((_, data) => callback({ content: data } as any)),
              sendToExchange: jest
                .fn<any, [string, any]>()
                .mockImplementation((_, data) => callback({ content: data } as any)),
              publish: jest
                .fn<any, [string, string, any]>()
                .mockImplementation((_, __, data) => callback({ content: data } as any)),
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

const eventCb = jest.fn(() => Promise.resolve());
let client!: PubSubClient<string>;
let server!: PubSubServer<string>;

beforeEach(async () => {
  const { channel } = await createAmqp('boop');
  client = new PubSubClient(channel);
  server = new PubSubServer(channel);
});

afterEach(() => jest.clearAllMocks());

test('publishing without init', () => {
  expect(() => server.publish('test')).toThrow(CordisBrokerError);
});

describe('publishing', () => {
  test('no fanout', async () => {
    await client.init({
      name: 'test',
      cb: eventCb
    });

    await server.init({ name: 'test' });

    server.publish('test');

    expect(eventCb).toHaveBeenCalled();
  });

  test('fanout', async () => {
    await client.init({
      name: 'test',
      fanout: true,
      cb: eventCb
    });

    await server.init({ name: 'test', fanout: true });

    server.publish('test');

    expect(eventCb).toHaveBeenCalled();
  });
});

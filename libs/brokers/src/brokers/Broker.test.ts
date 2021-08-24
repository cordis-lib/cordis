import { Broker } from './Broker';
import { createAmqp } from '../amqp';

jest.mock('amqplib', () => ({
  connect: jest
    .fn()
    .mockImplementation(() => {
      const on = jest
        .fn()
        .mockImplementation(() => ({ on }));

      return Promise.resolve({
        on,
        createChannel: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ cancel: jest.fn() }))
      });
    })
}));

test('destroying a broker', async () => {
  const { channel } = await createAmqp('host');
  // @ts-expect-error - Constructing base broker for testing
  const broker: Broker = new Broker(channel);
  broker.consumers.add('boop');

  expect(() => broker.destroy()).not.toThrow();

  await new Promise(resolve => setImmediate(resolve));

  expect(broker.consumers.size).toBe(0);
});

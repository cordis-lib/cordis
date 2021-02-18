import * as amqp from 'amqplib';

/**
 * AMQP connection and channel
 */
export interface AmqpResult {
  connection: amqp.Connection;
  channel: amqp.Channel;
}

/**
 * Creates an AMQP connection and channel
 * @param host URL for your AMQP server
 * @returns
 */
export const createAmqp = async (host: string): Promise<AmqpResult> => {
  host = host.replace(/amqp?\:?\/?\//g, '');

  const connection = await amqp.connect(`amqp://${host}`);

  return {
    connection,
    channel: await connection.createChannel()
  };
};

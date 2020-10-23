import * as amqplib from 'amqplib';
import { halt } from './halt';
import { tryImport } from './tryImport';

const amqp = tryImport<typeof import('amqplib')>('amqplib');

export const createAmqp = async (
  host: string,
  onClose: () => any,
  onError: (e: any) => any,
  reconnectTimeout = 5e3
): Promise<null | {
  connection: amqplib.Connection;
  channel: amqplib.Channel;
  host: string;
}> => {
  if (!amqp) return null;

  host = host.replace(/amqp?\:?\/?\//g, '');

  let connection: amqplib.Connection;

  try {
    connection = await amqp.connect(`amqp://${host}`);
  } catch (e) {
    await halt(reconnectTimeout);
    return createAmqp(host, onClose, onError, reconnectTimeout);
  }

  connection
    .on('close', onClose)
    .on('error', onError);

  return {
    connection,
    channel: await connection.createChannel(),
    host
  };
};

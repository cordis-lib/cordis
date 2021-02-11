import * as amqp from 'amqplib';

export interface AmqpOptions {
  host: string;
  onClose: () => any;
  onError: (e: any) => any;
}

export interface AmqpResult {
  connection: amqp.Connection;
  channel: amqp.Channel;
}

export const createAmqp = async (options: AmqpOptions): Promise<AmqpResult> => {
  const { onClose, onError } = options;
  const host = options.host.replace(/amqp?\:?\/?\//g, '');

  const connection = await amqp.connect(`amqp://${host}`);

  connection
    .on('close', onClose)
    .on('error', onError);

  return {
    connection,
    channel: await connection.createChannel()
  };
};

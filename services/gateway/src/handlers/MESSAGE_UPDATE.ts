import { Patcher } from '@cordis/util';
import { GatewayMessageUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageUpdate: Handler<GatewayMessageUpdateDispatch['d']> = async (data, service, redis) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.id);

  let message;

  if (rawMessage) {
    const { data: patchedMessage, old: o } = Patcher.patchMessage(data, JSON.parse(rawMessage));
    message = patchedMessage;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    service.publish({ o: o!, n: message }, 'messageUpdate');
  }

  if (!message) {
    const { data: patchedMessage } = Patcher.patchMessage(data);
    message = patchedMessage;
  }

  await redis.hset(`${data.channel_id}_messages`, message.id, JSON.stringify(message));
};

export default messageUpdate;

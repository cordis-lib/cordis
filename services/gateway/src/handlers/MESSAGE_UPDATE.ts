import { Patcher } from '@cordis/util';
import { APIMessage, GatewayMessageUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageUpdate: Handler<GatewayMessageUpdateDispatch['d']> = async (data, service, redis, rest) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.id);
  const updated: APIMessage = data.channel_id
    ? data
    : await rest
      .post({ path: `/channels/${data.channel_id}/messages/${data.id}`, method: 'GET' })
      .catch(() => data);

  let message;

  if (rawMessage) {
    const { data: patchedMessage, old: o } = Patcher.patchMessage(updated, JSON.parse(rawMessage));
    message = patchedMessage;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    service.publish({ o: o!, n: message }, 'messageUpdate');
  }

  if (!message) {
    const { data: patchedMessage } = Patcher.patchMessage(updated);
    message = patchedMessage;
  }

  await redis.hset(`${data.channel_id}_messages`, message.id, JSON.stringify(message));
};

export default messageUpdate;

import { Patcher } from '@cordis/util';
import { GatewayMessageDeleteBulkDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDeleteBulk: Handler<GatewayMessageDeleteBulkDispatch['d']> = async (data, service, redis) => {
  const rawMessages = await redis.hmget(`${data.channel_id}_messages`, ...data.ids);
  const messages = rawMessages
    .filter(e => e !== null)
    .map(e => Patcher.patchMessage(JSON.parse(e as string)).data);

  service.publish(messages, 'bulkMessageDelete');
  await redis.hdel(`${data.channel_id}_messages`, ...data.ids);
};

export default messageDeleteBulk;

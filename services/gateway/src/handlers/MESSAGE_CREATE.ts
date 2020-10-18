import { APIMessage } from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { Handler } from '../Handler';

const messageCreate: Handler<APIMessage> = async (data, service, redis) => {
  service.publish(data, 'messageCreate');
  const { data: message } = Patcher.patchMessage(data);
  await redis.hset(`${message.channel_id}_messages`, message.id, JSON.stringify(message));
};

export default messageCreate;

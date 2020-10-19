import { APIMessage } from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { Handler } from '../Handler';

const messageCreate: Handler<APIMessage> = async (data, service, cache) => {
  service.publish(data, 'messageCreate');
  const { data: message } = Patcher.patchMessage(data);
  await cache.set(`${message.channel_id}_messages`, message.id, message);
};

export default messageCreate;

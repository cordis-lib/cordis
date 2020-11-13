import { APIMessage } from 'discord-api-types';
import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { Handler } from '../Handler';

const messageCreate: Handler<APIMessage> = async (data, service, cache) => {
  const { data: message } = Patcher.patchMessage(data);
  service.publish(message, CORDIS_AMQP_SYMBOLS.gateway.events.messageCreate);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.messages(message.channel_id), message.id, message);
};

export default messageCreate;

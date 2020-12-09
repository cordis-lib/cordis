import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedMessage } from '@cordis/util';
import { GatewayMessageDeleteDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDelete: Handler<GatewayMessageDeleteDispatch['d']> = async (data, service, cache) => {
  const message = await cache.get<PatchedMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.id);
  if (message) {
    service.publish(message, CORDIS_AMQP_SYMBOLS.gateway.events.messageDelete);
    await cache.delete(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.id);
  }
};

export default messageDelete;

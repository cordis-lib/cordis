import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIMessage, PatchedReaction } from '@cordis/util';
import { GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemoveAll: Handler<GatewayMessageReactionRemoveAllDispatch['d']> = async (data, service, cache) => {
  const message = await cache.get<PatchedAPIMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.message_id);
  const store = await cache.get<PatchedReaction>(CORDIS_REDIS_SYMBOLS.cache.reactions(data.message_id));

  const reactions = await store.getM() as PatchedReaction[];
  service.publish({ reactions, message, messageId: data.message_id }, CORDIS_AMQP_SYMBOLS.gateway.events.messageReactionRemoveAll);
  await store.deleteM();
};

export default messageReactionRemoveAll;


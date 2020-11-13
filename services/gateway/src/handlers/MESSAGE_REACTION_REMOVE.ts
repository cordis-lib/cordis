import { CORDIS_REDIS_SYMBOLS, CordisReaction, CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { APIMessage, GatewayMessageReactionRemoveDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemove: Handler<GatewayMessageReactionRemoveDispatch['d']> = async (data, service, cache, _, botUser) => {
  const message = await cache.get<APIMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.message_id);
  const reaction = await cache.get<CordisReaction>(
    CORDIS_REDIS_SYMBOLS.cache.reactions(data.message_id),
    (data.emoji.id ?? data.emoji.name)!
  );

  if (reaction) {
    reaction.count--;
    reaction.me ??= data.user_id !== botUser.id;

    const users = new Set(reaction.users);
    users.delete(data.user_id);

    reaction.users = [...users];

    service.publish({ reaction, message, messageId: data.message_id }, CORDIS_AMQP_SYMBOLS.gateway.events.messageReactionRemove);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.reactions(data.message_id), (data.emoji.id ?? data.emoji.name)!, reaction);
  }
};

export default messageReactionRemove;

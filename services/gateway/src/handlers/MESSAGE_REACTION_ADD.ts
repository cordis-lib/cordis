import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, CordisReaction } from '@cordis/util';
import { APIMessage, GatewayMessageReactionAddDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionAdd: Handler<GatewayMessageReactionAddDispatch['d']> = async (data, service, cache, _, botUser) => {
  const message = await cache.get<APIMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.message_id);
  let reaction = await cache.get<CordisReaction>(CORDIS_REDIS_SYMBOLS.cache.reactions(data.message_id), (data.emoji.id ?? data.emoji.name)!);

  if (reaction) {
    reaction.count++;
    reaction.me ??= data.user_id === botUser.id;
    reaction.users.push(data.user_id);
  } else {
    reaction = {
      count: 1,
      emoji: data.emoji,
      me: data.user_id === botUser.id,
      users: [data.user_id]
    };
  }

  service.publish({ reaction, message, messageId: data.message_id }, CORDIS_AMQP_SYMBOLS.gateway.events.messageReactionAdd);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.reactions(data.channel_id), (data.emoji.id ?? data.emoji.name)!, reaction);
};

export default messageReactionAdd;

import { APIMessage, GatewayMessageReactionRemoveDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemove: Handler<GatewayMessageReactionRemoveDispatch['d']> = async (data, service, cache, _, [botUser]) => {
  const message = await cache.get<APIMessage>(`${data.channel_id}_messages`, data.message_id);
  if (message) {
    const existingIndex = (message.reactions ??= [])
      .findIndex(r => r.emoji.id === data.emoji.id || r.emoji.name === data.emoji.name);
    if (existingIndex !== -1) {
      const reaction = message.reactions[existingIndex];
      reaction.me = data.user_id === botUser.id;
      if (--reaction.count <= 0) message.reactions.splice(existingIndex, 1);
      else message.reactions.splice(existingIndex, 0, reaction);
    }

    service.publish({ emoji: data.emoji, message }, 'messsageReactionRemove');
    await cache.set(`${data.channel_id}_messages`, message.id, message);
  }
};

export default messageReactionRemove;

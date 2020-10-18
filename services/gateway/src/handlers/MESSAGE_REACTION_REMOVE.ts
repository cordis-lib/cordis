import { APIMessage, GatewayMessageReactionRemoveDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemove: Handler<GatewayMessageReactionRemoveDispatch['d']> = async (data, service, redis, rest, [botUser]) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: APIMessage | null = rawMessage
    ? JSON.parse(rawMessage)
    : null;

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
    await redis.hset(`${data.channel_id}_messages`, data.message_id, JSON.stringify(message));
  }
};

export default messageReactionRemove;

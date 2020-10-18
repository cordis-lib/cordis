import { APIMessage, GatewayMessageReactionAddDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionAdd: Handler<GatewayMessageReactionAddDispatch['d']> = async (data, service, redis, _, [botUser]) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: APIMessage | null = rawMessage
    ? JSON.parse(rawMessage)
    : null;

  if (message) {
    const existingIndex = (message.reactions ??= [])
      .findIndex(r => r.emoji.id === data.emoji.id || r.emoji.name === data.emoji.name);
    if (existingIndex !== -1) {
      const reaction = message.reactions[existingIndex];
      reaction.count++;
      reaction.me = data.user_id === botUser.id;
      message.reactions.splice(existingIndex, 1, reaction);
    } else {
      message.reactions.push({
        count: 1,
        emoji: data.emoji,
        me: data.user_id === botUser.id
      });
    }

    service.publish({ emoji: data.emoji, message }, 'messsageReactionAdd');
    await redis.hset(`${data.channel_id}_messages`, data.message_id, JSON.stringify(message));
  }
};

export default messageReactionAdd;

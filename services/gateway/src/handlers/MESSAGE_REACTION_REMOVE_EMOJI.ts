import { APIMessage, GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemoveEmoji: Handler<GatewayMessageReactionRemoveEmojiDispatch['d']> = async (data, service, redis) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: APIMessage | null = rawMessage
    ? JSON.parse(rawMessage)
    : null;

  if (message) {
    const existingIndex = (message.reactions ??= [])
      .findIndex(r => r.emoji.id === data.emoji.id || r.emoji.name === data.emoji.name);
    if (existingIndex !== -1) {
      message.reactions.splice(existingIndex, 1);
    }

    service.publish({ emoji: data.emoji, message }, 'messsageReactionRemoveEmoji');
    await redis.hset(`${data.channel_id}_messages`, data.message_id, JSON.stringify(message));
  }
};

export default messageReactionRemoveEmoji;

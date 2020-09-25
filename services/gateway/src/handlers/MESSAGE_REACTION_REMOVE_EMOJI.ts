import { Message, MessageReactionRemoveEmojiData } from '@cordis/types';
import { Handler } from '../Handler';

const messageReactionRemoveEmoji: Handler<MessageReactionRemoveEmojiData> = async (data, service, redis, rest) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: Message | null = rawMessage
    ? JSON.parse(rawMessage)
    : await rest
      .post({ path: `/channels/${data.channel_id}/messages/${data.message_id}` })
      .catch(() => null);

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

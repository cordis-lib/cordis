import { BaseReactionData, Message } from '@cordis/types';
import { Handler } from '../Handler';

const messageReactionRemove: Handler<BaseReactionData> = async (data, service, redis, rest, [botUser]) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: Message | null = rawMessage
    ? JSON.parse(rawMessage)
    : await rest
      .post({ path: `/channels/${data.channel_id}/messages/${data.message_id}` })
      .catch(() => null);
  const user = await rest.post({ path: `/users/${data.user_id}` });

  if (message) {
    const existingIndex = (message.reactions ??= [])
      .findIndex(r => r.emoji.id === data.emoji.id || r.emoji.name === data.emoji.name);
    if (existingIndex !== -1) {
      const reaction = message.reactions[existingIndex];
      reaction.me = data.user_id === botUser.id;
      if (--reaction.count <= 0) message.reactions.splice(existingIndex, 1);
      else message.reactions.splice(existingIndex, 0, reaction);
    }

    service.publish({ emoji: data.emoji, message, user }, 'messsageReactionRemove');
    await redis.hset(`${data.channel_id}_messages`, data.message_id, JSON.stringify(message));
  }
};

export default messageReactionRemove;

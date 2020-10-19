import { APIMessage, GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemoveEmoji: Handler<GatewayMessageReactionRemoveEmojiDispatch['d']> = async (data, service, cache) => {
  const message = await cache.get<APIMessage>(`${data.channel_id}_messages`, data.message_id);
  if (message) {
    const existingIndex = (message.reactions ??= [])
      .findIndex(r => r.emoji.id === data.emoji.id || r.emoji.name === data.emoji.name);
    if (existingIndex !== -1) {
      message.reactions.splice(existingIndex, 1);
    }

    service.publish({ emoji: data.emoji, message }, 'messsageReactionRemoveEmoji');
    await cache.set(`${data.channel_id}_messages`, message.id, message);
  }
};

export default messageReactionRemoveEmoji;

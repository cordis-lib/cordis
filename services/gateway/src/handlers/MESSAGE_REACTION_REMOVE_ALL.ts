import { APIMessage, GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemoveAll: Handler<GatewayMessageReactionRemoveAllDispatch['d']> = async (data, service, redis) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.message_id);
  const message: APIMessage | null = rawMessage
    ? JSON.parse(rawMessage)
    : null;

  if (message) {
    const reactions = message.reactions ?? [];
    service.publish({ reactions: reactions, message }, 'messsageReactionRemoveAll');
    message.reactions = [];
    await redis.hset(`${data.channel_id}_messages`, data.message_id, JSON.stringify(message));
  }
};

export default messageReactionRemoveAll;


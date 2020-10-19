import { APIMessage, GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageReactionRemoveAll: Handler<GatewayMessageReactionRemoveAllDispatch['d']> = async (data, service, cache) => {
  const message = await cache.get<APIMessage>(`${data.channel_id}_messages`, data.message_id);
  if (message) {
    const reactions = message.reactions ?? [];
    service.publish({ reactions: reactions, message }, 'messsageReactionRemoveAll');
    message.reactions = [];
    await cache.set(`${data.channel_id}_messages`, message.id, message);
  }
};

export default messageReactionRemoveAll;


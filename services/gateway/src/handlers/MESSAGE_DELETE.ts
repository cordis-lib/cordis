import { APIMessage, GatewayMessageDeleteDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDelete: Handler<GatewayMessageDeleteDispatch['d']> = async (data, service, cache) => {
  const message = await cache.get<APIMessage>(`${data.channel_id}_messages`, data.id);
  if (message) {
    service.publish(message, 'messageDelete');
    await cache.delete(`${data.channel_id}_messages`, data.id);
  }
};

export default messageDelete;

import { APIMessage, GatewayMessageDeleteDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDelete: Handler<GatewayMessageDeleteDispatch['d']> = async (data, service, redis) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.id);
  if (rawMessage) {
    const message = JSON.parse(rawMessage) as APIMessage;
    service.publish(message, 'messageDelete');
    await redis.hdel(`${data.channel_id}_messages`, data.id);
  }
};

export default messageDelete;

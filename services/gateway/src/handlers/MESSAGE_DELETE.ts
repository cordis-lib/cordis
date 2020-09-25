import { Message, MessageDeleteData } from '@cordis/types';
import { Handler } from '../Handler';

const messageDelete: Handler<MessageDeleteData> = async (data, service, redis) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.id);
  if (rawMessage) {
    const message = JSON.parse(rawMessage) as Message;
    service.publish(message, 'messageDelete');
  }
  await redis.hdel(`${data.channel_id}_messages`, data.id);
};

export default messageDelete;

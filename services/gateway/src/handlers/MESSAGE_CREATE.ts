import { Message } from '@cordis/types';
import { Handler } from '../Handler';

const messageCreate: Handler<Message> = async (data, service, redis) => {
  service.publish(data, 'messageCreate');
  await redis.hset(`${data.channel_id}_messages`, data.id, JSON.stringify(data));
};

export default messageCreate;

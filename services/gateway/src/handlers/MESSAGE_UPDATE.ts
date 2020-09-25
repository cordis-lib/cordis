import { Message, MessageUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const messageUpdate: Handler<MessageUpdateData> = async (data, service, redis, rest) => {
  const rawMessage = await redis.hget(`${data.channel_id}_messages`, data.id);
  const updated: Message = data.channel_id
    ? data
    : await rest
      .post({ path: `/channels/${data.channel_id}/messages/${data.id}`, method: 'GET' })
      .catch(() => data);

  if (rawMessage) {
    service.publish({ o: JSON.parse(rawMessage) as Message, n: updated }, 'messageUpdate');
  }

  await redis.hset(`${data.channel_id}_messages`, data.id, JSON.stringify(updated));
};

export default messageUpdate;

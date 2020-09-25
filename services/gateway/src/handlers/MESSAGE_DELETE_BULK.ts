import { MessageBulkDeleteData } from '@cordis/types';
import { Handler } from '../Handler';

const messageDeleteBulk: Handler<MessageBulkDeleteData> = async (data, service, redis) => {
  const rawMessages = await redis.hmget(`${data.channel_id}_messages`, ...data.ids);
  service.publish(
    rawMessages
      .filter(e => e !== null)
      .map(e => JSON.parse(e as string)),
    'bulkMessageDelete'
  );
  await redis.hdel(`${data.channel_id}_messages`, ...data.ids);
};

export default messageDeleteBulk;

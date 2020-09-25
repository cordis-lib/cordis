import { Guild } from '@cordis/types';
import { Handler } from '../Handler';

const guildUpdate: Handler<Guild> = async (data, service, redis) => {
  const found = await redis.hget('guilds', data.id);
  if (found) service.publish({ o: JSON.parse(found), n: data }, 'guildUpdate');
  await redis.hset('guilds', data.id, JSON.stringify(data));
};

export default guildUpdate;

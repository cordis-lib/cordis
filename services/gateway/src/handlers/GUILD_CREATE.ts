import { Guild } from '@cordis/types';
import { Handler } from '../Handler';

const guildCreate: Handler<Guild> = async (data, service, redis) => {
  const rawExisting = await redis.hget('guilds', data.id);
  const existing = rawExisting ? JSON.parse(rawExisting) as Guild : null;

  service.publish(data, existing?.unavailable && !data.unavailable ? 'guildAvailable' : 'guildCreate');

  await redis.hset('guilds', data.id, JSON.stringify(data));
};

export default guildCreate;

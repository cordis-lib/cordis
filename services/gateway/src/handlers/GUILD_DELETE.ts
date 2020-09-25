import { Guild } from '@cordis/types';
import { Handler } from '../Handler';

const guildDelete: Handler<Guild> = async (data, service, redis) => {
  if (data.unavailable) {
    const rawExisting = await redis.hget('guilds', data.id);
    const existing = rawExisting ? JSON.parse(rawExisting) as Guild : data;
    existing.unavailable = true;

    service.publish(existing, 'guildUnavailable');
    await redis.hset('guilds', data.id, JSON.stringify(existing));
  } else {
    service.publish(data, 'guildDelete');
    await redis.hdel('guilds', data.id);
  }
};

export default guildDelete;

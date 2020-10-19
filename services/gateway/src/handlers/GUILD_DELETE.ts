import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildDelete: Handler<APIGuild> = async (data, service, cache) => {
  if (data.unavailable) {
    const existing = await cache.get<APIGuild>('guilds', data.id) ?? data;
    existing.unavailable = true;

    service.publish(existing, 'guildUnavailable');
    await cache.set('guilds', existing.id, existing);
  } else {
    service.publish(data, 'guildDelete');
    await cache.delete('guilds', data.id);
  }
};

export default guildDelete;

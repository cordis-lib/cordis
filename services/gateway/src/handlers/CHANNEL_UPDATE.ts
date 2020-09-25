import { Channel, Guild } from '@cordis/types';
import { Handler } from '../Handler';

export const channelUpdate: Handler<Channel> = async (data, service, redis) => {
  if ('guild_id' in data) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as Guild;
      const oldIndex = (guild.channels ??= []).findIndex(e => e.id === data.id);
      if (oldIndex !== -1) {
        const old = guild.channels[oldIndex];
        service.publish({ o: old, n: data }, 'channelUpdate');
        guild.channels.splice(oldIndex, 1, data);
      } else {
        guild.channels = [data];
      }

      await redis.hset('guilds', guild.id, JSON.stringify(guild));
    }
  } else {
    service.publish(data, 'channelCreate');
    await redis.hset('dm_channels', data.id, JSON.stringify(data));
  }
};

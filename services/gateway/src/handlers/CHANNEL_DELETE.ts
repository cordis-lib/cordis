import { Channel, Guild } from '@cordis/types';
import { Handler } from '../Handler';

const channelDelete: Handler<Channel> = async (data, service, redis) => {
  if ('guild_id' in data) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as Guild;
      const index = (guild.channels ??= []).findIndex(e => e.id === data.id);
      if (index !== -1) guild.channels.splice(index, 1);
      service.publish(data, 'channelDelete');
      await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
    }
  } else {
    service.publish(data, 'channelDelete');
    await redis.hdel('dm_channels', data.id);
  }

  await redis.hdel(`${data.id}_messages`);
};

export default channelDelete;

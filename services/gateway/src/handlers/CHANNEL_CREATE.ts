import { Channel, Guild } from '@cordis/types';
import { Handler } from '../Handler';

const channelCreate: Handler<Channel> = async (data, service, redis) => {
  if ('guild_id' in data) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as Guild;
      (guild.channels ??= []).concat([data]);
      service.publish(data, 'channelCreate');
      await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
    }
  } else {
    service.publish(data, 'channelCreate');
    await redis.hset('dm_channels', data.id, JSON.stringify(data));
  }
};

export default channelCreate;

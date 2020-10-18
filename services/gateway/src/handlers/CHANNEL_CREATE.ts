import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const channelCreate: Handler<APIChannel> = async (data, service, redis) => {
  if (data.guild_id) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as APIGuild;
      const { data: channel } = Patcher.patchChannel(data);
      Patcher.patchGuild({ channels: (guild.channels ??= []).concat([channel]) }, guild);
      service.publish({ guild, channel }, 'channelCreate');
      await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
    }
  } else {
    const { data: channel } = Patcher.patchDmChannel(data);
    service.publish({ channel }, 'channelCreate');
    await redis.hset('dm_channels', data.id, JSON.stringify(data));
  }
};

export default channelCreate;

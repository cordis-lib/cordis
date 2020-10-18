import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Handler } from '../Handler';

const channelDelete: Handler<APIChannel> = async (data, service, redis) => {
  if (data.guild_id) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as APIGuild;
      const debug = makeDebugLog(`CHANNEL_DELETE_${guild.id}`, 2);
      debug(guild);

      const index = (guild.channels ??= []).findIndex(e => e.id === data.id);
      let channel = data;

      if (index !== -1) {
        channel = (guild.channels ??= []).splice(index, 1)[0];
        Patcher.patchGuild({ channels: guild.channels }, guild);
      }

      debug(guild);
      const { data: patchedChannel } = Patcher.patchChannel(channel);
      service.publish({ guild, channel: patchedChannel }, 'channelDelete');
      await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
    }
  } else {
    const { data: patchedChannel } = Patcher.patchChannel(data);
    service.publish({ channel: patchedChannel }, 'channelDelete');
    await redis.hdel('dm_channels', data.id);
  }

  await redis.hdel(`${data.id}_messages`);
};

export default channelDelete;

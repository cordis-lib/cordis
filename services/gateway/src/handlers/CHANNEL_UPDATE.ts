import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Handler } from '../Handler';

export const channelUpdate: Handler<APIChannel> = async (data, service, redis) => {
  if (data.guild_id) {
    const rawGuild = await redis.hget('guilds', data.guild_id);
    if (rawGuild) {
      const guild = JSON.parse(rawGuild) as APIGuild;
      const debug = makeDebugLog(`CHANNEL_UPDATE_${guild.id}`, 2);
      debug(guild);
      const oldIndex = (guild.channels ??= []).findIndex(e => e.id === data.id);
      if (oldIndex !== -1) {
        const oldUnpatched = guild.channels[oldIndex];
        const { old: o, data: n } = Patcher.patchChannel(data, oldUnpatched);

        service.publish({ guild, o: o!, n }, 'channelUpdate');
        guild.channels.splice(oldIndex, 1, data);
      } else {
        const { data: channel } = Patcher.patchChannel(data);
        guild.channels = [channel];
      }

      debug(guild);
      await redis.hset('guilds', guild.id, JSON.stringify(guild));
    }
  } else {
    const { data: channel } = Patcher.patchChannel(data);

    service.publish({ channel }, 'channelCreate');
    await redis.hset('dm_channels', data.id, JSON.stringify(data));
  }
};

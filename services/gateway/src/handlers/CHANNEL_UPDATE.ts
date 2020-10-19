import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

export const channelUpdate: Handler<APIChannel> = async (data, service, cache) => {
  if (data.guild_id) {
    const guild = await cache.get<APIGuild>('guilds', data.guild_id);
    if (guild) {
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

      await cache.set('guilds', guild.id, guild);
    }
  } else {
    const { data: channel } = Patcher.patchChannel(data);

    service.publish({ channel }, 'channelCreate');
    await cache.set('dm_channels', data.id, data);
  }
};

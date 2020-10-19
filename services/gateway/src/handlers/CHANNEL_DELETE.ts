import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const channelDelete: Handler<APIChannel> = async (data, service, cache) => {
  if (data.guild_id) {
    const guild = await cache.get<APIGuild>('guilds', data.guild_id);
    if (guild) {
      const index = (guild.channels ??= []).findIndex(e => e.id === data.id);
      let channel = data;

      if (index !== -1) {
        channel = (guild.channels ??= []).splice(index, 1)[0];
        Patcher.patchGuild({ channels: guild.channels }, guild);
      }

      const { data: patchedChannel } = Patcher.patchChannel(channel);
      service.publish({ guild, channel: patchedChannel }, 'channelDelete');
      await cache.set('guilds', guild.id, guild);
    }
  } else {
    const { data: patchedChannel } = Patcher.patchChannel(data);
    service.publish({ channel: patchedChannel }, 'channelDelete');
    await cache.delete('dm_channels', patchedChannel.id);
  }

  await cache.delete(`${data.id}_messages`);
};

export default channelDelete;

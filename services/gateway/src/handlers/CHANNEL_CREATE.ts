import { Patcher } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const channelCreate: Handler<APIChannel> = async (data, service, cache) => {
  if (data.guild_id) {
    const guild = await cache.get<APIGuild>('guilds', data.guild_id);
    if (guild) {
      const { data: channel } = Patcher.patchChannel(data);
      Patcher.patchGuild({ channels: (guild.channels ??= []).concat([channel]) }, guild);
      service.publish({ guild, channel }, 'channelCreate');
      await cache.set('guilds', guild.id, guild);
    }
  } else {
    const { data: channel } = Patcher.patchDmChannel(data);
    service.publish({ channel }, 'channelCreate');
    await cache.set('dm_channels', channel.id, channel);
  }
};

export default channelCreate;

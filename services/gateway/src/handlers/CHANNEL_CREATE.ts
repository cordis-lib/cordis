import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS, PatchedGuild } from '@cordis/util';
import { APIChannel } from 'discord-api-types';
import { Handler } from '../Handler';

const channelCreate: Handler<APIChannel> = async (data, service, cache) => {
  if (data.guild_id) {
    const guild = await cache.get<PatchedGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
    if (guild) {
      const { data: channel } = Patcher.patchChannel(data);
      service.publish({ guild, channel }, CORDIS_AMQP_SYMBOLS.gateway.events.channelCreate);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), channel.id, channel);
    }
  } else {
    const { data: channel } = Patcher.patchDmChannel(data);
    service.publish({ channel }, CORDIS_AMQP_SYMBOLS.gateway.events.channelCreate);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.channels(), channel.id, channel);
  }
};

export default channelCreate;

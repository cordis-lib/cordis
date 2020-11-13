import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

export const channelUpdate: Handler<APIChannel> = async (data, service, cache) => {
  if (data.guild_id) {
    const guild = await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
    if (guild) {
      const found = await cache.get<APIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), data.id);
      const { data: n, old: o } = found ? Patcher.patchChannel(data, found) : Patcher.patchChannel(data);
      if (o) service.publish({ guild, o, n }, CORDIS_AMQP_SYMBOLS.gateway.events.channelUpdate);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), n.id, n);
    }
  } else {
    const found = await cache.get<APIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(), data.id);
    const { data: n, old: o } = found ? Patcher.patchChannel(data, found) : Patcher.patchChannel(data);

    if (o) service.publish({ o, n }, CORDIS_AMQP_SYMBOLS.gateway.events.channelUpdate);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.channels(), n.id, n);
  }
};

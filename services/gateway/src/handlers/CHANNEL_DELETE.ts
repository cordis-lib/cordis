import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { APIChannel, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const channelDelete: Handler<APIChannel> = async (data, service, cache) => {
  const guild = data.guild_id ? await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id) : null;
  if (guild) {
    const old = await cache.get<APIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), data.id);
    const { data: channel } = old ? Patcher.patchChannel(data, old) : Patcher.patchChannel(data);

    service.publish({ guild, channel: old ?? channel }, CORDIS_AMQP_SYMBOLS.gateway.events.channelDelete);
    await cache.delete(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), channel.id);
  } else {
    const old = await cache.get<APIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(), data.id);
    const { data: channel } = old ? Patcher.patchChannel(data, old) : Patcher.patchChannel(data);
    service.publish({ channel: old ?? channel }, CORDIS_AMQP_SYMBOLS.gateway.events.channelDelete);
    await cache.delete(CORDIS_REDIS_SYMBOLS.cache.channels(), channel.id);
  }

  await cache.delete(CORDIS_REDIS_SYMBOLS.cache.messages(data.id));
};

export default channelDelete;

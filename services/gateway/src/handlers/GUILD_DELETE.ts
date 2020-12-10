import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildDelete: Handler<APIGuild> = async (data, service, cache) => {
  if (data.unavailable) {
    const existing = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.id);
    const { data: guild } = existing ? Patcher.patchGuild(data, existing) : Patcher.patchGuild(data);
    service.publish(guild, CORDIS_AMQP_SYMBOLS.gateway.events.guildUnavailable);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.guilds, guild.id, guild);
  } else {
    service.publish(Patcher.patchGuild(data).data, CORDIS_AMQP_SYMBOLS.gateway.events.guildDelete);
  }

  await cache.delete('guilds', data.id);
};

export default guildDelete;

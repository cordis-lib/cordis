import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS, PatchedAPIGuild } from '@cordis/util';
import { GatewayGuildBanRemoveDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanRemove: Handler<GatewayGuildBanRemoveDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const { data: user } = Patcher.patchUser(data.user);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.users, user.id, user);
  if (guild) {
    service.publish({ guild, user }, CORDIS_AMQP_SYMBOLS.gateway.events.guildBanRemove);
  }
};

export default guildBanRemove;

import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS, PatchedGuild } from '@cordis/util';
import { GatewayGuildBanAddDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanAdd: Handler<GatewayGuildBanAddDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const { data: user } = Patcher.patchUser(data.user);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.users, user.id, user);
  if (guild) {
    service.publish({ guild, user }, CORDIS_AMQP_SYMBOLS.gateway.events.guildBanAdd);
  }
};

export default guildBanAdd;

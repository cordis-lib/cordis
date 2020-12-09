import { GatewayGuildRoleDeleteDispatch, APIRole } from 'discord-api-types';
import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedGuild, Patcher } from '@cordis/util';
import { Handler } from '../Handler';

const guildRoleDelete: Handler<GatewayGuildRoleDeleteDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const existing = await cache.get<APIRole>(CORDIS_REDIS_SYMBOLS.cache.roles(data.guild_id), data.role_id);
  const role = existing ? Patcher.patchRole(existing).data : null;
  if (guild && role) service.publish({ guild, role }, CORDIS_AMQP_SYMBOLS.gateway.events.roleDelete);

  await cache.delete(CORDIS_REDIS_SYMBOLS.cache.roles(data.guild_id), data.role_id);
};

export default guildRoleDelete;

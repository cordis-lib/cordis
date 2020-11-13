import { Handler } from '../Handler';
import { GatewayGuildRoleUpdateDispatch, APIGuild, APIRole } from 'discord-api-types';
import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';

const guildRoleUpdate: Handler<GatewayGuildRoleUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const existing = await cache.get<APIRole>(CORDIS_REDIS_SYMBOLS.cache.roles(data.guild_id), data.role.id);
  const { data: n, old: o } = Patcher.patchRole(data.role, existing);
  if (guild && o) service.publish({ guild, o, n }, CORDIS_AMQP_SYMBOLS.gateway.events.roleUpdate);

  await cache.set(CORDIS_REDIS_SYMBOLS.cache.roles(data.guild_id), n.id, n);
};

export default guildRoleUpdate;

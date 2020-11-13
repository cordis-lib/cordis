import { Handler } from '../Handler';
import { GatewayGuildRoleCreateDispatch, APIGuild } from 'discord-api-types';
import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';

const guildRoleCreate: Handler<GatewayGuildRoleCreateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const { data: role } = Patcher.patchRole(data.role);
  if (guild) {
    service.publish({ guild, role }, CORDIS_AMQP_SYMBOLS.gateway.events.roleCreate);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.roles(data.guild_id), role.id, role);
  }
};

export default guildRoleCreate;

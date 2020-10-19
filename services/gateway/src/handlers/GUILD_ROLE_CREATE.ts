import { Handler } from '../Handler';
import { GatewayGuildRoleCreateDispatch, APIGuild } from 'discord-api-types';
import { Patcher } from '@cordis/util';

const guildRoleCreate: Handler<GatewayGuildRoleCreateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const { data: role } = Patcher.patchRole(data.role);
    guild.roles = guild.roles.concat([role]);
    service.publish({ guild, role }, 'roleCreate');
    await cache.set('guilds', guild.id, guild);
  }
};

export default guildRoleCreate;

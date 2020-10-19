import { GatewayGuildRoleDeleteDispatch, APIGuild } from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { Handler } from '../Handler';

const guildRoleDelete: Handler<GatewayGuildRoleDeleteDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const index = guild.roles.findIndex(e => e.id === data.role_id);
    const { data: role } = Patcher.patchRole(guild.roles.splice(index, 1)[0]);
    service.publish({ guild, role }, 'roleDelete');
    await cache.set('guilds', guild.id, guild);
  }
};

export default guildRoleDelete;

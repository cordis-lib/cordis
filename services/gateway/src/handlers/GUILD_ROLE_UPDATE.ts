import { Handler } from '../Handler';
import { GatewayGuildRoleUpdateDispatch, APIGuild } from 'discord-api-types';
import { Patcher } from '@cordis/util';

const guildRoleUpdate: Handler<GatewayGuildRoleUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const index = guild.roles.findIndex(e => e.id === data.role.id);
    const o = guild.roles.splice(index, 1, data.role)[0];
    const { data: n } = Patcher.patchRole(data.role, o);
    service.publish({ guild, o, n }, 'roleUpdate');
    await cache.set('guilds', guild.id, guild);
  }
};

export default guildRoleUpdate;

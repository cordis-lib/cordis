import { Handler } from '../Handler';
import { GatewayGuildRoleCreateDispatch, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Patcher } from '@cordis/util';

const guildRoleCreate: Handler<GatewayGuildRoleCreateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const debug = makeDebugLog(`GUILD_ROLE_CREATE_${guild.id}`, 2);
    debug(guild);
    const { data: role } = Patcher.patchRole(data.role);
    guild.roles = guild.roles.concat([role]);
    debug(guild);
    service.publish({ guild, role }, 'roleCreate');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildRoleCreate;

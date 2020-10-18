import { GatewayGuildRoleDeleteDispatch, APIGuild } from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { makeDebugLog } from '../debugLog';
import { Handler } from '../Handler';

const guildRoleDelete: Handler<GatewayGuildRoleDeleteDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const debug = makeDebugLog(`GUILD_ROLE_DELETE_${guild.id}`, 2);
    debug(guild);
    const index = guild.roles.findIndex(e => e.id === data.role_id);
    const { data: role } = Patcher.patchRole(guild.roles.splice(index, 1)[0]);
    service.publish({ guild, role }, 'roleDelete');
    debug(guild);
    await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
  }
};

export default guildRoleDelete;

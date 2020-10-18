import { Handler } from '../Handler';
import { GatewayGuildRoleUpdateDispatch, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Patcher } from '@cordis/util';

const guildRoleUpdate: Handler<GatewayGuildRoleUpdateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const debug = makeDebugLog(`GUILD_ROLE_UPDATE_${guild.id}`, 2);
    debug(guild);
    const index = guild.roles.findIndex(e => e.id === data.role.id);
    const o = guild.roles.splice(index, 1, data.role)[0];
    const { data: n } = Patcher.patchRole(data.role, o);
    service.publish({ guild, o, n }, 'roleUpdate');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildRoleUpdate;

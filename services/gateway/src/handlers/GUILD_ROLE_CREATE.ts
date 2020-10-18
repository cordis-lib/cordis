import { Handler } from '../Handler';
import { GatewayGuildRoleCreateDispatch, APIGuild } from 'discord-api-types';
import { Patcher } from '@cordis/util';

const guildRoleCreate: Handler<GatewayGuildRoleCreateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const { data: role } = Patcher.patchRole(data.role);
    guild.roles = guild.roles.concat([role]);
    service.publish({ guild, role }, 'roleCreate');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildRoleCreate;

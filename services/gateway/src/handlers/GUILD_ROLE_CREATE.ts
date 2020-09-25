import { Handler } from '../Handler';
import { Guild, RoleData } from '@cordis/types';

const guildRoleCreate: Handler<RoleData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    guild.roles = guild.roles.concat([data.role]);
    service.publish(data, 'roleCreate');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildRoleCreate;

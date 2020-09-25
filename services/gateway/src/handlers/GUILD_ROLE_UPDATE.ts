import { Handler } from '../Handler';
import { Guild, RoleData } from '@cordis/types';

const guildRoleUpdate: Handler<RoleData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    const index = guild.roles.findIndex(e => e.id === data.role.id);
    guild.roles.splice(index, 1, data.role);
    service.publish(data, 'roleUpdate');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildRoleUpdate;

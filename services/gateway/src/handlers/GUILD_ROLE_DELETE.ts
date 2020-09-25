import { Guild, GuildRoleDeleteData } from '@cordis/types';
import { Handler } from '../Handler';

const guildRoleDelete: Handler<GuildRoleDeleteData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    const index = guild.roles.findIndex(e => e.id === data.role_id);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    service.publish({ guild_id: data.guild_id, role: guild.roles.splice(index, 1)[0] }, 'roleDelete');
    await redis.hset('guilds', data.guild_id, JSON.stringify(guild));
  }
};

export default guildRoleDelete;

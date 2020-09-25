import { Guild, GuildMemberRemoveData } from '@cordis/types';
import { Handler } from '../Handler';

const guildMemberRemove: Handler<GuildMemberRemoveData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    const index = (guild.members ??= []).findIndex(e => e.user.id === data.user.id);
    if (index !== -1) guild.members.splice(0, 1);
    service.publish(data, 'guildMemberRemove');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }

  await redis.hset('users', data.user.id, JSON.stringify(data.user));
};

export default guildMemberRemove;

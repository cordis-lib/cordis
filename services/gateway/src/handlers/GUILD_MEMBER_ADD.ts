import { Guild, GuildMemberAddData } from '@cordis/types';
import { Handler } from '../Handler';

const guildMemberAdd: Handler<GuildMemberAddData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    guild.members = (guild.members ??= []).concat([data]);
    service.publish(data, 'guildMemberAdd');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
  await redis.hset('users', data.user.id, JSON.stringify(data.user));
};

export default guildMemberAdd;

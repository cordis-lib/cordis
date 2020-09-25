import { Guild, GuildMemberUpdateData, Member } from '@cordis/types';
import { Handler } from '../Handler';

const guildMemberUpdate: Handler<GuildMemberUpdateData> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as Guild;
    const oldIndex = (guild.members ??= []).findIndex(e => e.user.id === data.user.id);
    if (oldIndex !== -1) {
      const old = guild.members[oldIndex];
      const n = JSON.parse(JSON.stringify(old)) as Member;
      n.roles = data.roles;
      n.nick = data.nick;
      n.user = data.user;

      if (n.nick !== old.nick || !n.roles.every((role, i) => role === old.roles[i])) {
        service.publish({ o: old, n }, 'guildMemberUpdate');
      }

      if (
        n.user.username !== old.user.username ||
        n.user.discriminator !== old.user.discriminator ||
        n.user.avatar !== old.user.avatar
      ) {
        service.publish({ o: old.user, n: n.user }, 'userUpdate');
        await redis.hset('users', n.user.id, JSON.stringify(n.user));
      }

      guild.members.splice(oldIndex, 1, n);
      await redis.hset('guilds', guild.id, JSON.stringify(guild));
    }
  }
};

export default guildMemberUpdate;

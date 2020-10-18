import { Patcher } from '@cordis/util';
import { GatewayGuildMemberUpdateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberUpdate: Handler<GatewayGuildMemberUpdateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const oldIndex = (guild.members ??= []).findIndex(e => e.user!.id === data.user!.id);
    if (oldIndex !== -1) {
      const old = guild.members[oldIndex];
      const { data: n, newUser, oldUser, roles: [oldRoles, newRoles] } = Patcher.patchGuildMember(data, old);

      if (n.nick !== old.nick || !oldRoles.every((role, i) => role === newRoles[i])) {
        service.publish({ guild, o: old, n }, 'guildMemberUpdate');
      }

      if (
        (newUser && oldUser) &&
        (newUser.username !== oldUser.username ||
        newUser.discriminator !== oldUser.discriminator ||
        newUser.avatar !== oldUser.avatar)
      ) {
        service.publish({ o: old.user!, n: n.user! }, 'userUpdate');
        await redis.hset('users', newUser.id, JSON.stringify(n.user));
      }

      guild.members.splice(oldIndex, 1, n);
      await redis.hset('guilds', guild.id, JSON.stringify(guild));
    }
  }
};

export default guildMemberUpdate;

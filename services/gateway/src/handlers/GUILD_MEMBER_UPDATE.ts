import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, Patcher } from '@cordis/util';
import { GatewayGuildMemberUpdateDispatch, APIGuildMember } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberUpdate: Handler<GatewayGuildMemberUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>('guilds', data.guild_id);
  const existing = await cache.get<APIGuildMember>(CORDIS_REDIS_SYMBOLS.cache.members(data.guild_id), data.user!.id);
  const { data: n, old: o, newUser, oldUser, roles: [oldRoles, newRoles] } = Patcher.patchGuildMember(data, existing);
  if (guild) {
    if (n.nick !== o!.nick || !oldRoles.every((role, i) => role === newRoles[i])) {
      service.publish({ guild, o: o!, n }, CORDIS_AMQP_SYMBOLS.gateway.events.guildMemberUpdate);
    }

    if (
      (newUser && oldUser) &&
        (newUser.username !== oldUser.username ||
        newUser.discriminator !== oldUser.discriminator ||
        newUser.avatar !== oldUser.avatar)
    ) {
      service.publish({ o: oldUser, n: newUser }, CORDIS_AMQP_SYMBOLS.gateway.events.userUpdate);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.users, newUser.id, newUser);
    }
  }

  await cache.set(CORDIS_REDIS_SYMBOLS.cache.members(data.guild_id), n.user!.id, n);
};

export default guildMemberUpdate;

import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, PatchedAPIUser, Patcher } from '@cordis/util';
import { GatewayGuildMemberAddDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberAdd: Handler<GatewayGuildMemberAddDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const { data: member } = Patcher.patchGuildMember(data);
  if (guild) {
    service.publish({ guild, member }, CORDIS_AMQP_SYMBOLS.gateway.events.guildMemberAdd);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.members(data.guild_id), member.user!.id, member);
  }

  const existing = await cache.get<PatchedAPIUser>(CORDIS_REDIS_SYMBOLS.cache.users, member.user!.id);
  const { data: user } = existing ? Patcher.patchUser(data.user!, existing) : Patcher.patchUser(data.user!);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.users, user.id, user);
};

export default guildMemberAdd;

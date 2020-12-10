import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, Patcher } from '@cordis/util';
import { GatewayGuildMemberRemoveDispatch, APIGuildMember } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberRemove: Handler<GatewayGuildMemberRemoveDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  const existing = await cache.get<APIGuildMember>(CORDIS_REDIS_SYMBOLS.cache.members(data.guild_id), data.user.id);
  const { data: member } = Patcher.patchGuildMember(data, existing);
  if (guild) service.publish({ guild, member }, CORDIS_AMQP_SYMBOLS.gateway.events.guildMemberRemove);

  await cache.delete(CORDIS_REDIS_SYMBOLS.cache.members(data.guild_id), member.user!.id);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.users, member.user!.id, member.user);
};

export default guildMemberRemove;

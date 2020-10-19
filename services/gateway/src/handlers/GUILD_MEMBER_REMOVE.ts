import { Patcher } from '@cordis/util';
import { GatewayGuildMemberRemoveDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberRemove: Handler<GatewayGuildMemberRemoveDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const index = (guild.members ??= []).findIndex(e => e.user!.id === data.user.id);
    if (index !== -1) guild.members.splice(0, 1);
    const { data: member } = Patcher.patchGuildMember(data);
    service.publish({ guild, member }, 'guildMemberRemove');
    await cache.set('guilds', guild.id, guild);
  }

  await cache.set('users', data.user.id, data.user);
};

export default guildMemberRemove;

import { Patcher } from '@cordis/util';
import { GatewayGuildMemberAddDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberAdd: Handler<GatewayGuildMemberAddDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const { data: member } = Patcher.patchGuildMember(data);
    guild.members = (guild.members ??= []).concat([member]);
    service.publish({ guild, member }, 'guildMemberAdd');

    await cache.set('guilds', guild.id, guild);
  }

  await cache.set('users', data.user!.id, data.user);
};

export default guildMemberAdd;

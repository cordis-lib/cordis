import { Patcher } from '@cordis/util';
import { GatewayGuildMemberAddDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildMemberAdd: Handler<GatewayGuildMemberAddDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const { data: member } = Patcher.patchGuildMember(data);
    guild.members = (guild.members ??= []).concat([member]);
    service.publish({ guild, member }, 'guildMemberAdd');

    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
  await redis.hset('users', data.user!.id, JSON.stringify(data.user));
};

export default guildMemberAdd;

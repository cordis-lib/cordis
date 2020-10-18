import { Patcher } from '@cordis/util';
import { GatewayGuildMemberAddDispatch, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Handler } from '../Handler';

const guildMemberAdd: Handler<GatewayGuildMemberAddDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const debug = makeDebugLog(`GUILD_MEMBER_ADD_${guild.id}`, 2);
    debug(guild);
    const { data: member } = Patcher.patchGuildMember(data);
    guild.members = (guild.members ??= []).concat([member]);
    service.publish({ guild, member }, 'guildMemberAdd');
    debug(guild);
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
  await redis.hset('users', data.user!.id, JSON.stringify(data.user));
};

export default guildMemberAdd;

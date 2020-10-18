import { Patcher } from '@cordis/util';
import { GatewayGuildMemberRemoveDispatch, APIGuild } from 'discord-api-types';
import { makeDebugLog } from '../debugLog';
import { Handler } from '../Handler';

const guildMemberRemove: Handler<GatewayGuildMemberRemoveDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const debug = makeDebugLog(`GUILD_MEMBER_REMOVE_${guild.id}`, 2);
    debug(guild);
    const index = (guild.members ??= []).findIndex(e => e.user!.id === data.user.id);
    if (index !== -1) guild.members.splice(0, 1);
    debug(guild);
    const { data: member } = Patcher.patchGuildMember(data);
    service.publish({ guild, member }, 'guildMemberRemove');
    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }

  await redis.hset('users', data.user.id, JSON.stringify(data.user));
};

export default guildMemberRemove;

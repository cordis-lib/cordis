import { GatewayInviteDeleteDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const inviteDelete: Handler<GatewayInviteDeleteDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id!);
  const guild = rawGuild ? JSON.parse(rawGuild) as APIGuild : null;
  if (guild) service.publish({ guild, invite: data }, 'inviteCreate');
};

export default inviteDelete;

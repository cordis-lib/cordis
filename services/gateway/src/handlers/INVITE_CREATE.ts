import { GatewayInviteCreateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const inviteCreate: Handler<GatewayInviteCreateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id!);
  if (guild) service.publish({ guild, invite: data }, 'inviteCreate');
};

export default inviteCreate;

import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild } from '@cordis/util';
import { GatewayInviteCreateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const inviteCreate: Handler<GatewayInviteCreateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id!);
  if (guild) service.publish({ guild, invite: data }, CORDIS_AMQP_SYMBOLS.gateway.events.inviteCreate);
};

export default inviteCreate;

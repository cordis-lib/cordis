import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedGuild } from '@cordis/util';
import { GatewayInviteDeleteDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const inviteDelete: Handler<GatewayInviteDeleteDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id!);
  if (guild) service.publish({ guild, invite: data }, CORDIS_AMQP_SYMBOLS.gateway.events.inviteDelete);
};

export default inviteDelete;

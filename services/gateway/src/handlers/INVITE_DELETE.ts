import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIChannel, PatchedAPIGuild } from '@cordis/util';
import { GatewayInviteDeleteDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const inviteDelete: Handler<GatewayInviteDeleteDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id!);
  const channel = await cache.get<PatchedAPIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(data.guild_id), data.channel_id);
  if (guild && channel) service.publish({ guild, channel, ...data }, CORDIS_AMQP_SYMBOLS.gateway.events.inviteDelete);
};

export default inviteDelete;

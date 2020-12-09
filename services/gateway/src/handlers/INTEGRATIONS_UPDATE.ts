import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedGuild } from '@cordis/util';
import { GatewayGuildIntegrationsUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const integrationsUpdate: Handler<GatewayGuildIntegrationsUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<PatchedGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  if (guild) service.publish(guild, CORDIS_AMQP_SYMBOLS.gateway.events.guildIntegrationsUpdate);
};

export default integrationsUpdate;

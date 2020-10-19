import { GatewayGuildIntegrationsUpdateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const integrationsUpdate: Handler<GatewayGuildIntegrationsUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) service.publish(guild, 'guildIntegrationsUpdate');
};

export default integrationsUpdate;

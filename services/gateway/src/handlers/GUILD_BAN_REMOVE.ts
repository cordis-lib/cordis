import { Patcher } from '@cordis/util';
import { GatewayGuildBanRemoveDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanRemove: Handler<GatewayGuildBanRemoveDispatch['d']> = async (data, service, cache) => {
  const guild = await cache.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const { data: user } = Patcher.patchUser(data.user);
    service.publish({ guild, user }, 'guildBanRemove');
  }
};

export default guildBanRemove;

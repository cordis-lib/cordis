import { Patcher } from '@cordis/util';
import { GatewayGuildBanRemoveDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanRemove: Handler<GatewayGuildBanRemoveDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const { data: user } = Patcher.patchUser(data.user);
    service.publish({ guild, user }, 'guildBanRemove');
  }
};

export default guildBanRemove;

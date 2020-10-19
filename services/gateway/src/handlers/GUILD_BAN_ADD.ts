import { Patcher } from '@cordis/util';
import { GatewayGuildBanAddDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanAdd: Handler<GatewayGuildBanAddDispatch['d']> = async (data, service, redis) => {
  const guild = await redis.get<APIGuild>('guilds', data.guild_id);
  if (guild) {
    const { data: user } = Patcher.patchUser(data.user);
    service.publish({ guild, user }, 'guildBanAdd');
  }
};

export default guildBanAdd;

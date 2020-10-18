import { Patcher } from '@cordis/util';
import { GatewayGuildBanAddDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildBanAdd: Handler<GatewayGuildBanAddDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const guild = JSON.parse(rawGuild) as APIGuild;
    const { data: user } = Patcher.patchUser(data.user);
    service.publish({ guild, user }, 'guildBanAdd');
  }
};

export default guildBanAdd;

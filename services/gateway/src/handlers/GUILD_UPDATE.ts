import { Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildUpdate: Handler<APIGuild> = async (data, service, cache) => {
  const found = await cache.get<APIGuild>('guilds', data.id);
  if (found) {
    const { data: n, old: o } = Patcher.patchGuild(data, found);
    service.publish({ o: o!, n }, 'guildUpdate');
  }
  const { data: guild } = Patcher.patchGuild(data);
  await cache.set('guilds', guild.id, guild);
};

export default guildUpdate;

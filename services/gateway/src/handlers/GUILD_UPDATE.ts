import { Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildUpdate: Handler<APIGuild> = async (data, service, redis) => {
  const found = await redis.hget('guilds', data.id);
  if (found) {
    const { data: n, old: o } = Patcher.patchGuild(data, JSON.parse(found));
    service.publish({ o: o!, n }, 'guildUpdate');
  }
  const { data: guild } = Patcher.patchGuild(data);
  await redis.hset('guilds', data.id, JSON.stringify(guild));
};

export default guildUpdate;

import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildUpdate: Handler<APIGuild> = async (data, service, cache) => {
  const found = await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.id);
  const { data: n, old: o } = Patcher.patchGuild(data, found);
  if (o) service.publish({ o, n }, CORDIS_AMQP_SYMBOLS.gateway.events.guildUpdate);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.guilds, n.id, n);
};

export default guildUpdate;

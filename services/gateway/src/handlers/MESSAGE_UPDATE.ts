import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { GatewayMessageUpdateDispatch, APIMessage, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const messageUpdate: Handler<GatewayMessageUpdateDispatch['d']> = async (data, service, cache) => {
  const existing = await cache.get<APIMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), data.id);
  const { data: message, old } = existing ? Patcher.patchMessage(data, existing) : Patcher.patchMessage(data);
  const guild = data.guild_id ? await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id) : null;

  const res = {
    n: message,
    o: old,
    guild
  };

  if (!res.o) delete res.o;

  service.publish(res, CORDIS_AMQP_SYMBOLS.gateway.events.messageUpdate);
  await cache.set(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), message.id, message);
};

export default messageUpdate;

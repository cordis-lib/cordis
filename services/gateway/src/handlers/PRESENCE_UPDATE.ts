import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedPresence, Patcher } from '@cordis/util';
import { GatewayPresenceUpdate } from 'discord-api-types';
import { Handler } from '../Handler';

const presenceUpdate: Handler<GatewayPresenceUpdate> = async (data, service, cache) => {
  if (data.guild_id) {
    const existing = await cache.get<PatchedPresence>(CORDIS_REDIS_SYMBOLS.cache.presences(data.guild_id), data.user.id);
    const { data: presence, old: o } = Patcher.patchPresence(data, existing);
    service.publish({ n: presence, o }, CORDIS_AMQP_SYMBOLS.gateway.events.presenceUpdate);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.presences(data.guild_id), presence.user.id, presence);
  }
};

export default presenceUpdate;

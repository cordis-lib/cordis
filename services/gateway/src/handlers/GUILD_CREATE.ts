import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildCreate: Handler<APIGuild> = async (data, service, cache) => {
  const existing = await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.id);

  if (existing?.unavailable && !data.unavailable) {
    const { data: guild, triggerEmojiUpdate, emojiCreations, emojiDeletions, emojiUpdates } = Patcher.patchGuild(data, existing);
    service.publish(guild, CORDIS_AMQP_SYMBOLS.gateway.events.guildAvailable);

    if (triggerEmojiUpdate) {
      if (emojiCreations) {
        for (const emoji of emojiCreations) service.publish({ guild, emoji }, CORDIS_AMQP_SYMBOLS.gateway.events.emojiCreate);
      }

      if (emojiDeletions) {
        for (const emoji of emojiDeletions.values()) service.publish({ guild, emoji }, CORDIS_AMQP_SYMBOLS.gateway.events.emojiDelete);
      }

      if (emojiUpdates) {
        for (const [o, n] of emojiUpdates) service.publish({ guild, o, n }, CORDIS_AMQP_SYMBOLS.gateway.events.emojiUpdate);
      }
    }

    await cache.set(CORDIS_REDIS_SYMBOLS.cache.guilds, guild.id, guild);
  } else {
    const { data: guild } = Patcher.patchGuild(data);
    service.publish(guild, CORDIS_AMQP_SYMBOLS.gateway.events.guildCreate);
    await cache.set(CORDIS_REDIS_SYMBOLS.cache.guilds, guild.id, guild);
  }
};

export default guildCreate;

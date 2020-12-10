import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, Patcher } from '@cordis/util';
import { GatewayGuildEmojisUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const guildEmojisUpdate: Handler<GatewayGuildEmojisUpdateDispatch['d']> = async (data, service, cache) => {
  const existing = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id);
  if (existing) {
    const { data: guild, triggerEmojiUpdate, emojiCreations, emojiDeletions, emojiUpdates } = Patcher.patchGuild(data, existing);

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
  }
};

export default guildEmojisUpdate;

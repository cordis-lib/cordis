import { Patcher } from '@cordis/util';
import { GatewayGuildEmojisUpdateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildEmojisUpdate: Handler<GatewayGuildEmojisUpdateDispatch['d']> = async (data, service, cache) => {
  const existing = await cache.get<APIGuild>('guilds', data.guild_id);
  if (existing) {
    const { data: guild, triggerEmojiUpdate, emojiCreations, emojiDeletions, emojiUpdates } = Patcher.patchGuild(data, existing);

    if (triggerEmojiUpdate) {
      if (emojiCreations) {
        for (const emoji of emojiCreations) service.publish({ guild, emoji }, 'emojiCreate');
      }

      if (emojiDeletions) {
        for (const emoji of emojiDeletions.values()) service.publish({ guild, emoji }, 'emojiDelete');
      }

      if (emojiUpdates) {
        for (const [o, n] of emojiUpdates) service.publish({ guild, o, n }, 'emojiUpdate');
      }
    }

    await cache.set('guilds', guild.id, guild);
  }
};

export default guildEmojisUpdate;

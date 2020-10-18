import { Patcher } from '@cordis/util';
import { GatewayGuildEmojisUpdateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildEmojisUpdate: Handler<GatewayGuildEmojisUpdateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = await redis.hget('guilds', data.guild_id);
  if (rawGuild) {
    const existing = JSON.parse(rawGuild) as APIGuild;
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

    await redis.hset('guilds', guild.id, JSON.stringify(guild));
  }
};

export default guildEmojisUpdate;

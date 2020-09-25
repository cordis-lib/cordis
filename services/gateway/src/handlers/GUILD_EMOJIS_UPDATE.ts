import { Emoji, GuildEmojisUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const guildEmojisUpdate: Handler<GuildEmojisUpdateData> = async (data, service, redis) => {
  const existingRaw = await redis.hgetall(`${data.guild_id}_emojis`);
  const existing = new Map<string, Emoji>();
  const deleted = new Map<string, Emoji>();

  for (const key of Object.keys(existingRaw)) existing.set(key, JSON.parse(existingRaw[key]));
  for (const emoji of data.emojis) {
    const found = existing.get(emoji.id!);
    if (found) {
      deleted.delete(emoji.id!);
      service.publish({ o: found, n: emoji }, 'emojiUpdate');
    } else {
      service.publish(emoji, 'emojiCreate');
    }
  }

  for (const deletion of deleted.values()) service.publish(deletion, 'emojiDelete');
};

export default guildEmojisUpdate;

import { Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildCreate: Handler<APIGuild> = async (data, service, redis) => {
  const rawExisting = await redis.hget('guilds', data.id);
  const existing = rawExisting ? JSON.parse(rawExisting) as APIGuild : null;

  if (existing?.unavailable && !data.unavailable) {
    const { data: guild, triggerEmojiUpdate, emojiCreations, emojiDeletions, emojiUpdates } = Patcher.patchGuild(data, existing);
    service.publish(guild, 'guildAvailable');

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

    await redis.hset('guilds', data.id, JSON.stringify(guild));
  } else {
    const { data: guild } = Patcher.patchGuild(data);
    service.publish(guild, 'guildCreate');
    await redis.hset('guilds', data.id, JSON.stringify(guild));
  }
};

export default guildCreate;

import { Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildCreate: Handler<APIGuild> = async (data, service, redis) => {
  const existing = await redis.get<APIGuild>('guilds', data.id);

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

    await redis.set('guilds', guild.id, guild);
  } else {
    const { data: guild } = Patcher.patchGuild(data);
    service.publish(guild, 'guildCreate');
    await redis.set('guilds', guild.id, guild);
  }
};

export default guildCreate;

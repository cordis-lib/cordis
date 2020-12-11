import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, PatchedAPIGuild, Patcher } from '@cordis/util';
import { APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const guildCreate: Handler<APIGuild> = async (data, service, cache) => {
  const existing = await cache.get<PatchedAPIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.id);

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

    for (const channel of guild.channels) {
      const { data } = Patcher.patchChannel(channel);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.channels(guild.id), data.id, data);
    }

    for (const emoji of guild.emojis) {
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.emojis(guild.id), (emoji.id ?? emoji.name)!, emoji);
    }

    for (const member of guild.members) {
      const { data } = Patcher.patchGuildMember(member);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.members(guild.id), data.user!.id, data);
    }

    for (const role of guild.roles) {
      const { data } = Patcher.patchRole(role);
      await cache.set(CORDIS_REDIS_SYMBOLS.cache.roles(guild.id), data.id, data);
    }

    await cache.set(CORDIS_REDIS_SYMBOLS.cache.guilds, guild.id, guild);
  }
};

export default guildCreate;

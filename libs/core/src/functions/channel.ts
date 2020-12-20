import { PatchedAPIChannel, Patcher, Snowflake } from '@cordis/util';
import { ChannelType } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';
import type { CategoryChannel, Channel, VoiceChannel } from '../types';

const isAPIChannel = (channel: any): channel is PatchedAPIChannel =>
  'id' in channel &&
  'type' in channel &&
  channel.type >= ChannelType.GUILD_TEXT &&
  channel.type <= ChannelType.GUILD_STORE;

const isChannel = (channel: any): channel is Channel => 'id' in channel &&
  channel.toString() === `<@&${channel.id}>` &&
  'tags' in channel &&
  typeof channel.tags.premiumSubscriber === 'boolean';

const sanitizeChannel = (raw: PatchedAPIChannel | Channel, { functions: { retrieveFunction } }: FactoryMeta): Channel => {
  if (retrieveFunction('isChannel')(raw)) return raw;

  const base = Snowflake.getCreationData(raw.id);
  const guildBase = {
    ...base,
    guildId: raw.guild_id!,
    name: raw.name!,
    position: raw.position!,
    parentId: raw.parent_id ?? null,
    permissionOverwrites: raw.permission_overwrites ?? []
  };

  /* eslint-disable @typescript-eslint/naming-convention */
  switch (raw.type) {
    case ChannelType.GUILD_TEXT: {
      const {
        topic,
        nsfw,
        last_message_id,
        last_pin_timestamp,
        rate_limit_per_user,
        ...channel
      } = raw;

      const lastPinAt = last_pin_timestamp ? new Date(last_pin_timestamp) : null;

      return {
        ...channel,
        ...guildBase,
        topic,
        nsfw,
        lastMessageId: last_message_id,
        lastPinTimestamp: lastPinAt?.getTime() ?? null,
        lastPinAt,
        rateLimitPerUser: rate_limit_per_user ?? null,
        toString() {
          return `<#${this.id}>`;
        }
      };
    }

    case ChannelType.GUILD_VOICE: {
      const {
        bitrate,
        user_limit,
        ...channel
      } = raw;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        ...channel,
        ...guildBase,
        bitrate: bitrate !== 0 ? bitrate : null,
        userLimit: user_limit !== 0 ? user_limit : null,
        toString() {
          return this.name;
        }
      } as VoiceChannel;
    }

    case ChannelType.GUILD_STORE: {
      const {
        nsfw,
        ...channel
      } = raw;

      return {
        ...channel,
        ...guildBase,
        nsfw,
        toString() {
          return `<#${this.id}>`;
        }
      };
    }

    case ChannelType.GUILD_NEWS:
    case ChannelType.GUILD_CATEGORY: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        ...raw,
        ...guildBase,
        toString() {
          return this.name;
        }
      } as CategoryChannel;
    }

    case ChannelType.DM: {
      const {
        recipients,
        ...channel
      } = raw;

      return {
        ...channel,
        ...base,
        recipients: recipients.map(
          user => retrieveFunction('sanitizeUser')(
            Patcher.patchUser(user).data
          )
        ),
        toString() {
          return this.id;
        }
      };
    }
  }
};

export {
  isAPIChannel,
  isChannel,
  sanitizeChannel
};

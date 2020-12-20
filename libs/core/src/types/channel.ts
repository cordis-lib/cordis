import type { SnowflakeEntity } from '@cordis/util';
import type { APIPartialChannel, APIOverwrite, ChannelType } from 'discord-api-types';
import type { User } from './user';

interface BaseChannel extends Omit<APIPartialChannel, 'name' | 'type'>, SnowflakeEntity {
  toString(): string;
}

interface BaseGuildChannel extends BaseChannel {
  guildId: string;
  name: string;
  position: number;
  parentId: string | null;
  permissionOverwrites: APIOverwrite[];
}

interface DMChannel extends BaseChannel {
  type: ChannelType.DM;
  recipients: User[];
}

interface CategoryChannel extends BaseGuildChannel {
  type: ChannelType.GUILD_CATEGORY;
}

interface NewsChannel extends BaseGuildChannel {
  type: ChannelType.GUILD_NEWS;
}

interface StoreChannel extends BaseGuildChannel {
  type: ChannelType.GUILD_STORE;
  nsfw: boolean;
}

interface TextChannel extends BaseGuildChannel {
  type: ChannelType.GUILD_TEXT;
  topic: string | null;
  nsfw: boolean;
  lastMessageId: string | null;
  lastPinTimestamp: number | null;
  lastPinAt: Date | null;
  rateLimitPerUser: number | null;
}

interface VoiceChannel extends BaseGuildChannel {
  type: ChannelType.GUILD_VOICE;
  bitrate: number | null;
  userLimit: number | null;
}

type Channel =
| DMChannel
| CategoryChannel
| NewsChannel
| StoreChannel
| TextChannel
| VoiceChannel;

export {
  BaseChannel,
  BaseGuildChannel,
  DMChannel,
  CategoryChannel,
  NewsChannel,
  StoreChannel,
  TextChannel,
  VoiceChannel,
  Channel
};

import { PatchedAPIRole } from '@cordis/util';
import type {
  AuditLogEvent,
  ChannelType,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildSystemChannelFlags,
  GuildVerificationLevel
} from 'discord-api-types';
import type { BaseGuildChannel } from './channel';
import type { Overwrite } from './generic';
import type { FileResolvable } from './resolve';

interface GetGuildAuditLogQuery {
  userId?: string;
  actionType?: AuditLogEvent;
  before?: string;
  limit?: number;
}

interface PatchChannelData {
  name: string;
  type: ChannelType.GUILD_TEXT | ChannelType.GUILD_NEWS;
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  rateLimitPerUser?: number | null;
  bitrate?: number | null;
  userLimit?: number | null;
  permissionOverwrites?: Overwrite[] | null;
  parentId?: string | null;
}

interface CreateGuildData {
  name: string;
  region?: string;
  icon?: FileResolvable;
  verificationLevel?: GuildVerificationLevel;
  defaultMessageNotifications?: GuildDefaultMessageNotifications;
  explicitContentFilter?: GuildExplicitContentFilter;
  roles?: PatchedAPIRole[];
  channels?: (Partial<Omit<BaseGuildChannel, 'name' | 'guildId'>> & { name: string })[];
  afkChannelId?: string;
  afkTimeout?: number;
  systemChannelId?: number;
  systemChannelFlags?: GuildSystemChannelFlags;
}

interface PatchGuildData {
  name?: string;
  region?: string | null;
  verificationLevel?: GuildVerificationLevel | null;
  defaultMessageNotifications?: GuildDefaultMessageNotifications | null;
  explicitContentFilter?: GuildExplicitContentFilter | null;
  afkChannelId?: string | null;
  afkTimeout?: number;
  icon?: FileResolvable | null;
  ownerId: string;
  splash?: FileResolvable | null;
  banner?: FileResolvable | null;
  systemChannelId?: string | null;
  systemChannelFlags?: number;
  rulesChannelId?: string | null;
  publicUpdatesChannelId?: string | null;
  preferredLocale?: string | null;
}

export {
  GetGuildAuditLogQuery,

  PatchChannelData,

  CreateGuildData,
  PatchGuildData
};

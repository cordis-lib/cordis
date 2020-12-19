import type {
  APIGuildCreatePartialChannel,
  AuditLogEvent,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildSystemChannelFlags,
  GuildVerificationLevel
} from 'discord-api-types';
import type { FileResolvable, RoleResolvable } from './resolver';

interface GetGuildAuditLogQuery {
  userId?: string;
  actionType?: AuditLogEvent;
  before?: string;
  limit?: number;
}

interface CreateGuildData {
  name: string;
  region?: string;
  icon?: FileResolvable;
  verificationLevel?: GuildVerificationLevel;
  defaultMessageNotifications?: GuildDefaultMessageNotifications;
  explicitContentFilter?: GuildExplicitContentFilter;
  roles?: RoleResolvable[];
  // TODO channels for guild creation
  channels?: APIGuildCreatePartialChannel[];
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
  systemChannelFlags?: number | null;
  rulesChannelId?: string | null;
  publicUpdatesChannelId?: string | null;
  preferredLocale?: string | null;
}

export {
  GetGuildAuditLogQuery,
  CreateGuildData,
  PatchGuildData
};

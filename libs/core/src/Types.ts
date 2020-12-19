import type {
  FrozenBitField,
  PatchedAPIChannel,
  PatchedAPIClientUser,
  PatchedAPIGuild,
  PatchedAPIInvite,
  PatchedAPIRole,
  PatchedAPIUser,
  SnowflakeEntity
} from '@cordis/util';
import type {
  APIAuditLogChange,
  APIAuditLogEntry,
  APIGuildCreatePartialChannel,
  APIGuildIntegration,
  APIGuildIntegrationApplication,
  APIGuildMember,
  APIGuildPreview,
  APIInvite,
  APIPartialChannel,
  APIWebhook,
  AuditLogEvent,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel,
  IntegrationExpireBehavior,
  InviteTargetUserType,
  WebhookType
} from 'discord-api-types';
import type { rawData } from './util/Symbols';
import type { UserFlagKeys, UserFlags } from './util/UserFlags';
import type { Readable } from 'stream';

interface VoiceState {
  guildId: string | null;
  channelId: string | null;
  userId: string;
  // TODO: Members
  member: APIGuildMember | null;
  sessionId: string;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfStream: boolean;
  selfVideo: boolean;
  suppress: boolean;
}

// Begin audit log types
enum AuditLogEntryTargetType {
  all,
  guild,
  channel,
  user,
  role,
  invite,
  webhook,
  emoji,
  message,
  integration,
  unknown
}

enum AuditLogOptionalInfoType {
  role,
  member
}

type ChannelOverwriteAuditLogEvents =
| AuditLogEvent.CHANNEL_OVERWRITE_CREATE
| AuditLogEvent.CHANNEL_OVERWRITE_UPDATE
| AuditLogEvent.CHANNEL_OVERWRITE_DELETE;

type OptionPropReflectingAuditLogEvents =
| ChannelOverwriteAuditLogEvents
| AuditLogEvent.MEMBER_PRUNE
| AuditLogEvent.MEMBER_MOVE
| AuditLogEvent.MEMBER_DISCONNECT
| AuditLogEvent.MESSAGE_PIN
| AuditLogEvent.MESSAGE_UNPIN
| AuditLogEvent.MESSAGE_DELETE
| AuditLogEvent.MESSAGE_BULK_DELETE;

interface AuditLogEntryOptionalInfo<T extends AuditLogEvent> {
  deleteMemberDays: T extends AuditLogEvent.MEMBER_PRUNE ? number : never;
  membersRemoved: T extends AuditLogEvent.MEMBER_PRUNE ? number : never;
  channelId: T extends AuditLogEvent.MEMBER_MOVE | AuditLogEvent.MESSAGE_PIN | AuditLogEvent.MESSAGE_UNPIN | AuditLogEvent.MESSAGE_DELETE
    ? string
    : never;
  messageId: T extends AuditLogEvent.MESSAGE_PIN | AuditLogEvent.MESSAGE_UNPIN ? string : never;
  count: T extends
  | AuditLogEvent.MESSAGE_DELETE | AuditLogEvent.MESSAGE_BULK_DELETE | AuditLogEvent.MEMBER_DISCONNECT | AuditLogEvent.MEMBER_MOVE
    ? number
    : never;
  id: T extends ChannelOverwriteAuditLogEvents ? string : never;
  type: T extends ChannelOverwriteAuditLogEvents ? AuditLogOptionalInfoType : never;
  roleName: T extends ChannelOverwriteAuditLogEvents ? string : never;
}

interface APIAuditLogChangeData<K extends string, D extends unknown> {
  key: K;
  /* eslint-disable @typescript-eslint/naming-convention */
  new_value?: D;
  old_value?: D;
  /* eslint-enable @typescript-eslint/naming-convention */
}

type MakeAuditLogEntryChange<T> = T extends APIAuditLogChangeData<infer K, infer D> ? {
  key: K;
  new: D | null;
  old: D | null;
} : never;

type AuditLogEntryChange = MakeAuditLogEntryChange<APIAuditLogChange>;

interface AuditLogEntry<T extends AuditLogEvent> extends SnowflakeEntity, Omit<
APIAuditLogEntry,
'target_id' | 'changes' | 'user_id' | 'action_type' | 'options' | 'reason'
> {
  targetId: string | null;
  targetType: AuditLogEntryTargetType;
  changes: AuditLogEntryChange[];
  userId: string;
  actionType: T;
  options: T extends OptionPropReflectingAuditLogEvents ? AuditLogEntryOptionalInfo<T> : null;
  reason: string | null;
}

interface AuditLog {
  webhooks: Map<string, Webhook>;
  users: Map<string, User>;
  integrations: Map<string, Integration>;
  auditLogEntires: Map<string, AuditLogEntry<AuditLogEvent>>;
}
// End audit log types

// Begin cdn types
interface UserAvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin http types
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
// End http types

// Begin integration types
interface GuildIntegrationApplication extends Omit<APIGuildIntegrationApplication, 'bot'> {
  bot: User | null;
}

interface Integration extends SnowflakeEntity, Omit<
APIGuildIntegration,
'syncing' | 'role_id' | 'enable_emoticons' |
'expire_behavior' | 'expire_grace_period' | 'user' |
'synced_at' | 'subscriber_count' | 'revoked' | 'application'
> {
  syncing: boolean;
  roleId: string | null;
  enableEmoticons: boolean;
  expireBehavior: IntegrationExpireBehavior | null;
  expireGracePeriod: number | null;
  user: User | null;
  syncedTimestamp: string | null;
  syncedAt: Date | null;
  subscriberCount: number | null;
  revoked: boolean;
  application: GuildIntegrationApplication | null;
}
// End integration types

// Begin guild types
interface GuildWelcomeScreenChannel {
  channelId: string;
  emojiId: string | null;
  emojiName: string | null;
}

interface GuildWelcomeScreen {
  description: string | null;
  welcomeChannels: GuildWelcomeScreenChannel[];
}

interface GuildPreview extends Omit<APIGuildPreview, 'discovery_splash' | 'approximate_member_count' | 'approximate_presence_count'> {
  discoverySplash: string | null;
  approximateMemberCount: number;
  approximatePresenceCount: number;
}

interface Guild extends SnowflakeEntity, Omit<
PatchedAPIGuild,
'verification_level' | 'owner_id' | 'afk_channel_id' |
'afk_timeout' | 'vanity_url_code' | 'widget_enabled' | 'widget_channel_id' |
'default_message_notifications' | 'explicit_content_filter' |
'system_channel_id' | 'system_channel_flags' | 'rules_channel_id' |
'joined_at' | 'member_count' | 'voice_states' |
'max_presences' | 'max_members' | 'premium_tier' |
'premium_subscription_count' | 'preferred_locale' | 'public_updates_channel_id' |
'max_video_channel_users' | 'approximate_member_count' | 'approximate_presence_count' |
'welcome_screen' | 'application_id' | 'discovery_splash' |
'mfa_level'
> {
  verificationLevel: GuildVerificationLevel;
  vanityUrlCode: string | null;
  discoverySplash: string | null;
  ownerId: string;
  afkChannelId: string | null;
  afkTimeout: number;
  widgetEnabled: boolean;
  widgetChannelId: string | null;
  defaultMessageNotifications: GuildDefaultMessageNotifications;
  explicitContentFilter: GuildExplicitContentFilter;
  mfaLevel: GuildMFALevel;
  applicationId: string | null;
  systemChannelId: string | null;
  systemChannelFlags: GuildSystemChannelFlags;
  rulesChannelId: string | null;
  joinedTimestamp: string | null;
  joinedAt: Date | null;
  welcomeScreen: GuildWelcomeScreen | null;
  memberCount: number;
  voiceStates: Omit<VoiceState, 'guildId'>[];
  maxPresences: number | null;
  maxMembers: number;
  premiumTier: GuildPremiumTier;
  premiumSubscriptionCount: number | null;
  preferredLocale: string;
  publicUpdatesChannelId: string | null;
  maxVideoChannelUsers: number | null;
  approximateMemberCount?: number;
  approximatePresenceCount?: number;
  toString(): string;
  [rawData]: PatchedAPIGuild;
}
// End guild types

// Begin invite types
interface Invite extends Omit<
APIInvite,
'approximate_member_count' | 'approximate_presence_count' | 'target_user' | 'target_user_type' | 'channel' | 'inviter' | 'guild'
> {
  guild: Guild | null;
  code: string;
  // TODO: Channel
  channel: PatchedAPIChannel;
  inviter: User;
  memberCount: number | null;
  presenceCount: number | null;
  target: User | null;
  targetType: InviteTargetUserType | null;
  readonly url: string;
  toString(): string;
  [rawData]: PatchedAPIInvite;
}
// End invite types

// Begin resolver types
type ColorResolvable = string | number | number[];
type BufferResolvable = Buffer | string;
type FileResolvable = BufferResolvable | Readable;

type GuildResolvable = PatchedAPIGuild | Guild;
type InviteResolvable = PatchedAPIInvite | Invite;
type RoleResolvable = PatchedAPIRole | Role;
type UserResolvable = PatchedAPIUser | User;
// End resolver types

// Begin role types
interface RoleTags {
  botId: string | null;
  premiumSubscriber: boolean;
  integrationId: string | null;
}

interface Role extends Omit<PatchedAPIRole, 'tags'>, SnowflakeEntity {
  tags: RoleTags;
  toString(): string;
  [rawData]: PatchedAPIRole;
}
// End role types

// Begin user types
interface User extends Omit<PatchedAPIUser, 'public_flags'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedAPIUser;
}

interface ClientUser extends Omit<PatchedAPIClientUser, 'public_flags' | 'mfa_enabled'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  mfaEnabled: boolean;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedAPIClientUser;
}
// End user types

// Begin webhook types
interface BaseWebhook extends SnowflakeEntity, Omit<
APIWebhook,
'guild_id' | 'channel_id' | 'user' | 'application_id' | 'source_guild' | 'source_channel'
> {
  guildId: string | null;
  channelId: string;
  user: User | null;
  sourceGuild: Guild | null;
  // TODO channels
  sourceChannel: APIPartialChannel | null;
  applicationId: string | null;
}

interface IncomingWebhook extends BaseWebhook {
  type: WebhookType.Incoming;
  token: string;
}

interface ChannelFollowerWebhook extends Omit<BaseWebhook, 'token'> {
  type: WebhookType.ChannelFollower;
  token: never | null;
}

type Webhook = IncomingWebhook | ChannelFollowerWebhook;
// End webhook types
interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  VoiceState,

  AuditLogEntryTargetType,
  AuditLogOptionalInfoType,
  OptionPropReflectingAuditLogEvents,
  AuditLogEntryOptionalInfo,
  AuditLogEntryChange,
  AuditLogEntry,
  AuditLog,

  UserAvatarOptions,

  GuildWelcomeScreenChannel,
  GuildWelcomeScreen,
  GuildPreview,
  Guild,

  GetGuildAuditLogQuery,
  CreateGuildData,
  PatchGuildData,

  GuildIntegrationApplication,
  Integration,

  Invite,

  ColorResolvable,
  BufferResolvable,
  FileResolvable,
  GuildResolvable,
  InviteResolvable,
  RoleResolvable,
  UserResolvable,

  User,
  ClientUser,

  RoleTags,
  Role,

  IncomingWebhook,
  ChannelFollowerWebhook,
  Webhook,

  CoreEvents
};

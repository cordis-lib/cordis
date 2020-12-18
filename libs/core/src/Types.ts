import {
  FrozenBitField,
  PatchedAPIChannel,
  PatchedAPIClientUser,
  PatchedAPIGuild,
  PatchedAPIInvite,
  PatchedAPIRole,
  PatchedAPIUser,
  SnowflakeEntity
} from '@cordis/util';
import {
  APIGuildCreatePartialChannel,
  APIGuildMember,
  APIGuildPreview,
  APIInvite,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel,
  InviteTargetUserType
} from 'discord-api-types';
import { rawData } from './util/Symbols';
import { UserFlagKeys, UserFlags } from './util/UserFlags';
import { Readable } from 'stream';

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

// Begin cdn types
interface UserAvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin http types
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
  systemChannelId: string | null;
  rulesChannelId: string | null;
  publicUpdatesChannelId: string | null;
  preferredLocale: string | null;
}
// End http types

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
interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  VoiceState,

  UserAvatarOptions,

  CreateGuildData,
  PatchGuildData,

  GuildWelcomeScreenChannel,
  GuildWelcomeScreen,
  GuildPreview,
  Guild,

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

  CoreEvents
};

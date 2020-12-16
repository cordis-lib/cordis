import {
  FrozenBitField,
  PatchedAPIChannel,
  PatchedAPIClientUser,
  PatchedAPIGuild,
  PatchedAPIInvite,
  PatchedAPIUser,
  SnowflakeEntity
} from '@cordis/util';
import {
  APIGuildWelcomeScreen,
  APIInvite,
  GatewayVoiceState,
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

// Begin cdn types
interface UserAvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin guild types
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
  // TODO: proper structure
  welcomeScreen: APIGuildWelcomeScreen | null;
  memberCount: number;
  // TODO: voice states
  voiceStates: Omit<GatewayVoiceState, 'guild_id'>[] | null;
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

type GuildResolvable = PatchedAPIGuild | Guild;
// End guild types

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

type UserResolvable = PatchedAPIUser | User;
// End user types

// Begin invite types
interface Invite extends Omit<
APIInvite,
'approximate_member_count' | 'approximate_presence_count' | 'target_user' | 'target_user_type' | 'channel' | 'inviter' | 'guild'
> {
  // TODO: Guild
  guild: PatchedAPIGuild | null;
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

type InviteResolvable = PatchedAPIInvite | Invite;
// End invite types

interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  UserAvatarOptions,

  Guild,
  GuildResolvable,

  User,
  ClientUser,
  UserResolvable,

  Invite,
  InviteResolvable,

  CoreEvents
};

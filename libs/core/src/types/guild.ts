import type {
  APIGuildPreview,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel
} from 'discord-api-types';
import type { PatchedAPIGuild, SnowflakeEntity } from '@cordis/common';
import type { rawData } from '../util/Symbols';
import type { VoiceState } from './generic';

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
  joinedTimestamp: number | null;
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

export {
  GuildWelcomeScreenChannel,
  GuildWelcomeScreen,
  GuildPreview,
  Guild
};

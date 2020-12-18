import { PatchedAPIGuild, Snowflake } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { Guild } from '../Types';
import { rawData } from '../util/Symbols';

const isAPIGuild = (guild: any): guild is Guild => 'name' in guild && 'owner_id' in guild && 'member_count' in guild;

const isGuild = (guild: any): guild is Guild => 'name' in guild && guild.name === guild.toString() && 'ownerId' in guild;

const sanitizeGuild = (raw: PatchedAPIGuild | Guild, { functions: { retrieveFunction } }: FactoryMeta): Guild => {
  if (retrieveFunction('isGuild')(raw)) return raw;

  const {
    /* eslint-disable @typescript-eslint/naming-convention */
    verification_level,
    vanity_url_code,
    discovery_splash,
    owner_id,
    afk_channel_id,
    afk_timeout,
    widget_enabled,
    widget_channel_id = null,
    default_message_notifications,
    explicit_content_filter,
    mfa_level,
    application_id,
    system_channel_id,
    system_channel_flags,
    rules_channel_id,
    member_count,
    joined_at = null,
    welcome_screen = null,
    voice_states = null,
    max_presences,
    max_members,
    premium_tier,
    premium_subscription_count = null,
    preferred_locale,
    public_updates_channel_id,
    max_video_channel_users = null,
    approximate_member_count,
    approximate_presence_count,
    ...guild
  /* eslint-enable @typescript-eslint/naming-convention */
  } = raw;

  return {
    ...guild,
    ...Snowflake.getCreationData(guild.id),
    verificationLevel: verification_level,
    vanityUrlCode: vanity_url_code,
    discoverySplash: discovery_splash,
    ownerId: owner_id,
    afkChannelId: afk_channel_id,
    afkTimeout: afk_timeout,
    widgetEnabled: widget_enabled,
    widgetChannelId: widget_channel_id,
    defaultMessageNotifications: default_message_notifications,
    explicitContentFilter: explicit_content_filter,
    mfaLevel: mfa_level,
    applicationId: application_id,
    systemChannelId: system_channel_id,
    systemChannelFlags: system_channel_flags,
    rulesChannelId: rules_channel_id,
    memberCount: member_count,
    joinedTimestamp: joined_at,
    joinedAt: joined_at ? new Date(joined_at) : null,
    welcomeScreen: {
      description: welcome_screen?.description ?? null,
      welcomeChannels: welcome_screen?.welcome_channels
        .map(screen => ({ channelId: screen.channel_id, emojiId: screen.emoji_id, emojiName: screen.emoji_name })) ?? []
    },
    voiceStates: voice_states?.map(state => ({
      channelId: state.channel_id,
      userId: state.user_id,
      member: state.member ?? null,
      sessionId: state.session_id,
      deaf: state.deaf,
      mute: state.mute,
      selfDeaf: state.self_deaf,
      selfMute: state.self_mute,
      selfStream: state.self_stream ?? false,
      selfVideo: state.self_video,
      suppress: state.suppress
    })) ?? [],
    maxPresences: max_presences,
    maxMembers: max_members,
    premiumTier: premium_tier,
    premiumSubscriptionCount: premium_subscription_count,
    preferredLocale: preferred_locale,
    publicUpdatesChannelId: public_updates_channel_id,
    maxVideoChannelUsers: max_video_channel_users,
    approximateMemberCount: approximate_member_count,
    approximatePresenceCount: approximate_presence_count,
    toString() {
      return this.name;
    },
    [rawData]: raw
  };
};

export {
  isAPIGuild,
  isGuild,
  sanitizeGuild
};

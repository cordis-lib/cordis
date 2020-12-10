import { APIEmoji, APIGuild } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedAPIGuild extends RequiredProp<
APIGuild,
'member_count' | 'large' | 'features' |
'unavailable' | 'widget_enabled' | 'max_members' |
'max_presences' | 'channels' | 'roles' | 'members' | 'emojis' | 'presences'
> {}

export default <T extends PatchedAPIGuild | null | undefined>(n: Partial<APIGuild>, o?: T) => {
  const data = o ?? n;

  /* eslint-disable @typescript-eslint/naming-convention */
  const {
    name,
    icon,
    splash,
    region,
    member_count,
    large,
    features,
    application_id,
    afk_timeout,
    afk_channel_id,
    system_channel_id,
    system_channel_flags,
    premium_tier,
    verification_level,
    explicit_content_filter,
    mfa_level,
    joined_at,
    default_message_notifications,
    vanity_url_code,
    description,
    banner,
    unavailable,
    rules_channel_id,
    public_updates_channel_id,
    premium_subscription_count,
    widget_enabled,
    widget_channel_id,
    max_members,
    max_presences,
    approximate_member_count,
    approximate_presence_count,
    owner_id,
    channels,
    roles,
    members,
    presences,
    emojis
  } = n;
    /* eslint-enable @typescript-eslint/naming-convention */

  data.name = name ?? data.name;
  data.icon = icon ?? data.icon;
  data.splash = splash ?? data.splash;
  data.region = region ?? data.region;
  data.owner_id = owner_id ?? data.owner_id;
  data.member_count = member_count ?? data.member_count;
  data.large = large ?? data.large ?? false;
  data.features = features ?? data.features ?? [];
  data.application_id = application_id ?? data.application_id;
  data.afk_timeout = afk_timeout ?? data.afk_timeout;
  data.afk_channel_id = afk_channel_id ?? data.afk_channel_id;
  data.system_channel_id = system_channel_id ?? data.system_channel_id;
  data.system_channel_flags = system_channel_flags ?? data.system_channel_flags;
  data.premium_tier = premium_tier ?? data.premium_tier;
  data.verification_level = verification_level ?? data.verification_level;
  data.explicit_content_filter = explicit_content_filter ?? data.explicit_content_filter;
  data.mfa_level = mfa_level ?? data.mfa_level;
  data.joined_at = joined_at ?? data.joined_at;
  data.default_message_notifications = default_message_notifications ?? data.default_message_notifications;
  data.vanity_url_code = vanity_url_code ?? data.vanity_url_code;
  data.description = description ?? data.description;
  data.banner = banner ?? data.banner;
  data.unavailable = unavailable ?? data.unavailable ?? false;
  data.rules_channel_id = rules_channel_id ?? data.rules_channel_id;
  data.public_updates_channel_id = public_updates_channel_id ?? data.public_updates_channel_id;
  data.premium_subscription_count = premium_subscription_count ?? data.premium_subscription_count;
  data.widget_enabled = widget_enabled ?? data.widget_enabled ?? false;
  data.widget_channel_id = widget_channel_id ?? data.widget_channel_id;
  data.max_members = max_members ?? data.max_members ?? 25e4;
  data.max_presences = max_presences ?? data.max_presences ?? 25e3;
  data.approximate_member_count = approximate_member_count ?? data.approximate_member_count;
  data.approximate_presence_count = approximate_presence_count ?? data.approximate_presence_count;
  data.channels = channels ?? data.channels ?? [];
  data.roles = roles ?? data.roles ?? [];
  data.members = members ?? data.members ?? [];

  let triggerEmojiUpdate = false;
  let emojiCreations = null;
  let emojiDeletions = null;
  let emojiUpdates = null;

  if (!data.emojis) {
    data.emojis = emojis ?? [];
  } else if (emojis) {
    triggerEmojiUpdate = true;

    emojiDeletions = new Map<string, APIEmoji>(emojis.map(e => [e.id!, e]));
    for (const emoji of data.emojis) {
      const foundIndex = data.emojis.findIndex(e => e.id === emoji.id);
      if (foundIndex !== -1) {
        const found = data.emojis[foundIndex];
        emojiDeletions.delete(found.id!);
        (emojiUpdates ??= []).push([data.emojis.splice(foundIndex, 1, emoji)[0], emoji]);
      } else {
        (emojiCreations ??= []).push(emoji);
        data.emojis.push(emoji);
      }
    }

    for (const deletion of emojiDeletions.values()) {
      const foundIndex = data.emojis.findIndex(e => e.id === deletion.id);
      data.emojis.splice(foundIndex, 1);
    }

    data.emojis = emojis;
  }

  data.presences = presences ?? data.presences ?? [];

  return {
    data: data as PatchedAPIGuild,
    old: o as T,
    triggerEmojiUpdate,
    emojiCreations,
    emojiDeletions,
    emojiUpdates
  };
};

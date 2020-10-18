import { APIEmoji, APIGuild } from 'discord-api-types';

export const patch = (n: Partial<APIGuild>, o?: APIGuild | null) => {
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

  if (name !== undefined) data.name = name;
  if (icon !== undefined) data.icon = icon;
  if (splash !== undefined) data.splash = splash;
  if (region !== undefined) data.region = region;
  if (owner_id !== undefined) data.owner_id = owner_id;
  if (member_count !== undefined) data.member_count = member_count;
  data.large = large ?? data.large ?? false;
  data.features = features ?? data.features ?? [];
  if (application_id !== undefined) data.application_id = application_id;
  if (afk_timeout !== undefined) data.afk_timeout = afk_timeout;
  if (afk_channel_id !== undefined) data.afk_channel_id = afk_channel_id;
  if (system_channel_id !== undefined) data.system_channel_id = system_channel_id;
  if (system_channel_flags !== undefined) data.system_channel_flags = system_channel_flags;
  if (premium_tier !== undefined) data.premium_tier = premium_tier;
  if (verification_level !== undefined) data.verification_level = verification_level;
  if (explicit_content_filter !== undefined) data.explicit_content_filter = explicit_content_filter;
  if (mfa_level !== undefined) data.mfa_level = mfa_level;
  data.joined_at = joined_at ?? data.joined_at;
  if (default_message_notifications !== undefined) data.default_message_notifications = default_message_notifications;
  if (vanity_url_code !== undefined) data.vanity_url_code = vanity_url_code;
  if (description !== undefined) data.description = description;
  if (banner !== undefined) data.banner = banner;
  if (unavailable !== undefined) data.unavailable = data.unavailable ?? false;
  if (rules_channel_id !== undefined) data.rules_channel_id = rules_channel_id;
  if (public_updates_channel_id !== undefined) data.public_updates_channel_id = public_updates_channel_id;
  if (premium_subscription_count !== undefined) data.premium_subscription_count = premium_subscription_count;
  data.widget_enabled = widget_enabled ?? data.widget_enabled ?? false;
  data.widget_channel_id = widget_channel_id ?? data.widget_channel_id;
  data.max_members = max_members ?? data.max_members ?? 250000;
  data.max_presences = max_presences ?? data.max_presences ?? 25000;
  if (approximate_member_count != null) data.approximate_member_count = approximate_member_count;
  if (approximate_presence_count != null) data.approximate_presence_count = approximate_presence_count;

  if (channels) data.channels = channels;
  if (roles) data.roles = roles;
  if (members) data.members = members;

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

  if (presences) data.presences = presences;

  return {
    data: data as APIGuild,
    old: o,
    triggerEmojiUpdate,
    emojiCreations,
    emojiDeletions,
    emojiUpdates
  };
};

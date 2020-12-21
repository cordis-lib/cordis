import {
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildResult,
  RESTPatchAPIGuildJSONBody,
  RESTPatchAPIGuildResult,
  RESTPostAPIGuildsJSONBody,
  RESTPostAPIGuildsResult,
  Routes
} from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { CordisCoreError } from '../../util/Error';
import type { CreateGuildData, GuildPreview, GuildResolvable, PatchGuildData } from '../../types';
import type { FactoryMeta } from '../../FunctionManager';

const createGuild = async (data: CreateGuildData | RESTPostAPIGuildsJSONBody, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const isRaw = (data: CreateGuildData | RESTPostAPIGuildsJSONBody): data is RESTPostAPIGuildsJSONBody =>
    'default_message_notifications' in data ||
    'explicit_content_filter' in data ||
    'afk_channel_id' in data ||
    'afk_timeout' in data ||
    'system_channel_id' in data;

  const final: RESTPostAPIGuildsJSONBody = isRaw(data)
    ? data
    : {
      name: data.name,
      region: data.region,
      icon: data.icon ? await retrieveFunction('resolveImage')(data.icon) : undefined,
      /* eslint-disable @typescript-eslint/naming-convention */
      verification_level: data.verificationLevel,
      default_message_notifications: data.defaultMessageNotifications,
      explicit_content_filter: data.explicitContentFilter,
      roles: data.roles,
      channels: data.channels,
      afk_channel_id: data.afkChannelId,
      afk_timeout: data.afkTimeout,
      system_channel_id: data.systemChannelId,
      system_channel_flags: data.systemChannelFlags
      /* eslint-enable @typescript-eslint/naming-convention */
    };

  return rest
    .post<RESTPostAPIGuildsResult>(Routes.guilds(), { data: final })
    .then(
      data => retrieveFunction('sanitizeGuild')(
        Patcher.patchGuild(data).data
      )
    );
};

const getGuild = (guild: GuildResolvable | string, withCounts = false, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  return rest
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .get<RESTGetAPIGuildResult>(Routes.guild(guild), { query: { with_counts: withCounts } })
    .then(
      data => retrieveFunction('sanitizeGuild')(
        Patcher.patchGuild(data).data
      )
    );
};

const getGuildPreview = (
  guild: GuildResolvable | string,
  { functions: { retrieveFunction }, rest }: FactoryMeta
): Promise<GuildPreview> => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  return rest
    .get<RESTGetAPIGuildPreviewResult>(Routes.guildPreview(guild))
    .then(data => ({
      ...data,
      discoverySplash: data.discovery_splash,
      approximateMemberCount: data.approximate_member_count,
      approximatePresenceCount: data.approximate_presence_count
    }));
};

const patchGuild = async (
  guild: GuildResolvable | string,
  data: PatchGuildData | RESTPatchAPIGuildJSONBody,
  { functions: { retrieveFunction }, rest }: FactoryMeta
) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  const isRaw = (data: PatchGuildData | RESTPatchAPIGuildJSONBody): data is RESTPatchAPIGuildJSONBody =>
    'verification_level' in data ||
    'default_message_notifications' in data ||
    'explicit_content_filter' in data ||
    'afk_channel_id' in data ||
    'afk_timeout' in data ||
    'owner_id' in data ||
    'system_channel_id' in data ||
    'rules_channel_id' in data ||
    'public_updates_channel_id' in data ||
    'preferred_locale' in data;

  const final: RESTPatchAPIGuildJSONBody = isRaw(data)
    ? data
    : {
      name: data.name,
      region: data.region,
      /* eslint-disable @typescript-eslint/naming-convention */
      verification_level: data.verificationLevel,
      default_message_notifications: data.defaultMessageNotifications,
      explicit_content_filter: data.explicitContentFilter,
      afk_channel_id: data.afkChannelId,
      afk_timeout: data.afkTimeout,
      icon: data.icon ? await retrieveFunction('resolveImage')(data.icon) : undefined,
      owner_id: data.ownerId,
      splash: data.splash ? await retrieveFunction('resolveImage')(data.splash) : undefined,
      banner: data.banner ? await retrieveFunction('resolveImage')(data.banner) : undefined,
      system_channel_id: data.systemChannelId,
      system_channel_flags: data.systemChannelFlags,
      rules_channel_id: data.rulesChannelId,
      public_updates_channel_id: data.publicUpdatesChannelId,
      preferred_locale: data.preferredLocale
    /* eslint-enable @typescript-eslint/naming-convention */
    };

  return rest
    .post<RESTPatchAPIGuildResult>(Routes.guild(guild), { data: final })
    .then(
      data => retrieveFunction('sanitizeGuild')(
        Patcher.patchGuild(data).data
      )
    );
};

export {
  createGuild,
  getGuild,
  getGuildPreview,
  patchGuild
};

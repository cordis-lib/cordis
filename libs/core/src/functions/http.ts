import {
  Routes,
  RESTGetAPIUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  RESTDeleteAPICurrentUserGuildResult,
  RESTGetAPIInviteResult,
  RESTDeleteAPIInviteResult,
  RESTGetAPIGuildResult,
  RESTGetAPIGuildPreviewResult,
  RESTPostAPIGuildsJSONBody,
  RESTPostAPIGuildsResult,
  RESTPatchAPIGuildJSONBody,
  RESTPatchAPIGuildResult,
  RESTGetAPIGuildRolesResult,
  RESTGetAPIAuditLogResult,
  RESTGetAPIAuditLogQuery
} from 'discord-api-types';
import {
  CreateGuildData,
  GetGuildAuditLogQuery,
  GuildPreview,
  GuildResolvable,
  InviteResolvable,
  PatchGuildData,
  UserResolvable
} from '../types';
import { Patcher } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { CordisCoreError } from '../util/Error';

// Begin audit log functions
const getAuditLog = (
  guild: GuildResolvable | string,
  query: GetGuildAuditLogQuery | RESTGetAPIAuditLogQuery,
  { functions: { retrieveFunction }, rest }: FactoryMeta
) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  const isRaw = (data: GetGuildAuditLogQuery | RESTGetAPIAuditLogQuery): data is RESTGetAPIAuditLogQuery =>
    'user_id' in data ||
    'action_type' in data;

  const final: RESTGetAPIAuditLogQuery = isRaw(query)
    ? query
    : {
      /* eslint-disable @typescript-eslint/naming-convention */
      action_type: query.actionType,
      before: query.before,
      limit: query.limit,
      user_id: query.userId
      /* eslint-enable @typescript-eslint/naming-convention */
    };

  return rest
    .get<RESTGetAPIAuditLogResult>(Routes.guildAuditLog(guild), { query: final })
    .then(data => retrieveFunction('sanitizeAuditLog')(data));
};
// End audit log functions

// Begin guild functions
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
      roles: data.roles?.map(r => retrieveFunction('sanitizeRole')(r)),
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

  // @ts-ignore
  // TODO wait for discord-api-types fix
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
// End guild functions

// Begin user functions
/**
 * Attempts to fetch a user
 */
const getUser = (user: UserResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof user !== 'string') {
    const resolved = retrieveFunction('resolveUserId')(user);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'user id');
    user = resolved;
  }

  return rest
    .get<RESTGetAPIUserResult>(Routes.user(user))
    .then(data => retrieveFunction('sanitizeUser')(Patcher.patchUser(data).data));
};

const patchClientUser = (data: RESTPatchAPICurrentUserJSONBody, { rest, gateway, functions }: FactoryMeta) => rest
  .patch<RESTPatchAPICurrentUserResult>(Routes.user('@me'), { data })
  .then(
    res => functions.retrieveFunction('sanitizeClientUser')(
      Patcher.patchClientUser(res, gateway.clientUser![rawData]).data
    )
  );

const deleteClientGuild = (data: GuildResolvable, { rest, functions: { retrieveFunction } }: FactoryMeta) => {
  const guild = retrieveFunction('resolveGuildId')(data);
  if (!guild) throw new CordisCoreError('entityUnresolved', 'guild id');

  return rest.delete<RESTDeleteAPICurrentUserGuildResult>(Routes.userGuild(guild));
};

// @ts-ignore
// TODO: channels
// eslint-disable-next-line
const createDmChannel = (user: UserResolvable | string, { functions: { retrieveFunction }, channels, rest }: FactoryMeta) => null;
// End user functions

// Begin invite functions
const getInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  if (!code) throw new CordisCoreError('entityUnresolved', 'invite code');

  return rest
    .get<RESTGetAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanitizeInvite')({
        ...data,
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};

const deleteInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  if (!code) throw new CordisCoreError('entityUnresolved', 'invite code');

  return rest
    .delete<RESTDeleteAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanitizeInvite')({
        ...data,
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};
// End invite functions

// Begin role functions
const getRoles = (guild: GuildResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  return rest
    .get<RESTGetAPIGuildRolesResult>(Routes.guildRoles(guild))
    .then(
      roles => roles.map(
        role => retrieveFunction('sanitizeRole')(
          Patcher.patchRole(role).data
        )
      )
    );
};
// End role functions

export {
  getAuditLog,

  createGuild,
  getGuild,
  getGuildPreview,
  patchGuild,

  getUser,
  patchClientUser,
  deleteClientGuild,
  createDmChannel,

  getInvite,
  deleteInvite,

  getRoles
};

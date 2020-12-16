import {
  Routes,
  RESTGetAPIUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  RESTDeleteAPICurrentUserGuildResult,
  RESTGetAPIInviteResult,
  RESTDeleteAPIInviteResult,
  RESTGetAPIGuildResult,
  RESTGetAPIGuildPreviewResult
} from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { CordisCoreError } from '../util/Error';
import { GuildPreview, GuildResolvable, InviteResolvable, UserResolvable } from '../Types';

// Begin guild functions
const getGuild = (guild: GuildResolvable | string, withCounts = false, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  return rest
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .get<RESTGetAPIGuildResult>(Routes.guild(guild), { query: { with_counts: withCounts } })
    .then(data => retrieveFunction('sanitizeGuild')(Patcher.patchGuild(data).data));
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
  .then(res => functions.retrieveFunction('sanitizeClientUser')(Patcher.patchClientUser(res, gateway.clientUser![rawData]).data));

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

export {
  getGuild,
  getGuildPreview,

  getUser,
  patchClientUser,
  deleteClientGuild,
  createDmChannel,

  getInvite,
  deleteInvite
};

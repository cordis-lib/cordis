import {
  Routes,
  RESTGetAPIUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  RESTDeleteAPICurrentUserGuildResult,
  RESTGetAPIInviteResult,
  RESTDeleteAPIInviteResult
} from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { InviteResolvable, User, UserResolvable } from '../Types';

// Begin user functions
/**
 * Attempts to fetch a user; retrieves from cache if possible
 */
const getUser = async (user: UserResolvable | string, useCache = true, { functions: { retrieveFunction }, users, rest }: FactoryMeta) => {
  if (typeof user !== 'string') {
    const resolved = retrieveFunction('resolveUserId')(user);
    // TODO: Internal errors
    if (!resolved) return null;
    user = resolved;
  }

  let cached: User | undefined;
  if (useCache && (cached = await users.get(user))) {
    return cached;
  }

  const result = await rest.get<RESTGetAPIUserResult>(Routes.user(user))
    .then(data => {
      const { data: patched } = Patcher.patchUser(data, cached?.[rawData]);
      return retrieveFunction('sanatizeUser')(patched);
    });

  await users.set(result.id, result);
  return result;
};

const patchClientUser = (data: RESTPatchAPICurrentUserJSONBody, { rest, gateway, functions }: FactoryMeta) => rest
  .patch<RESTPatchAPICurrentUserResult>(Routes.user('@me'), { data })
  .then(res => {
    const { data: patched } = Patcher.patchClientUser(res, gateway.clientUser![rawData]);
    return functions.retrieveFunction('sanatizeClientUser')(patched);
  });

// TODO: guild resolvable
const deleteClientGuild = (data: string, { rest }: FactoryMeta) => rest
  .delete<RESTDeleteAPICurrentUserGuildResult>(Routes.userGuild(data));

// @ts-ignore
// TODO: channels
// eslint-disable-next-line
const createDmChannel = (user: UserResolvable | string, { functions: { retrieveFunction }, channels, rest }: FactoryMeta) => null;
// End user functions

// Begin invite functions
// TODO Consider invite cache
const getInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  // TODO: Internal errors
  if (!code) return null;

  return rest
    .get<RESTGetAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanatizeInvite')({
        ...data,
        // TODO Guild, Channel
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};

const deleteInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  // TODO: Internal errors
  if (!code) return null;

  return rest
    .delete<RESTDeleteAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanatizeInvite')({
        ...data,
        // TODO Guild, Channel
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};
// End invite functions

export {
  getUser,
  patchClientUser,
  deleteClientGuild,
  createDmChannel,

  getInvite,
  deleteInvite
};

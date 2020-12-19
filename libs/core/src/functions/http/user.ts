import {
  RESTDeleteAPICurrentUserGuildResult,
  RESTGetAPIUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  Routes
} from 'discord-api-types';
import { Patcher } from '@cordis/util';
import { CordisCoreError } from '../../util/Error';
import { rawData } from '../../util/Symbols';
import type { FactoryMeta } from '../../FunctionManager';
import type { GuildResolvable, UserResolvable } from '../../types';

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

export {
  getUser,
  patchClientUser,
  deleteClientGuild,
  createDmChannel
};

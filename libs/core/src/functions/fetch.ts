import { Patcher } from '@cordis/util';
import { APIUser } from 'discord-api-types';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { CordisUser, UserResolvable } from '../Types';

/**
 * Attempts to fetch a user; retrieves from cache if possible
 */
const fetchUser = async (user: UserResolvable | string, useCache = true, { functions: { retrieveFunction }, users, rest }: FactoryMeta) => {
  if (typeof user !== 'string') {
    const resolved = retrieveFunction('resolveUserId')(user);
    // TODO: Internal errors
    if (!resolved) return null;
    user = resolved;
  }

  let cached: CordisUser | undefined;
  if (useCache && (cached = await users.get(user))) {
    return cached;
  }

  const result = await rest.get<APIUser>(`/users/${user}`)
    .then(data => {
      const { data: patched } = Patcher.patchUser(data, cached?.[rawData]);
      return retrieveFunction('sanatizeUser')(patched);
    });

  await users.set(user, result);
  return result;
};

export {
  fetchUser
};

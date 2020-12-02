import { CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { APIUser } from 'discord-api-types';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { CordisUser, UserResolvable } from '../Types';

/**
 * Attempts to fetch a user; retrieves from cache if possible
 */
const fetchUser = async (user: UserResolvable | string, useCache = true, { functions: { retrieveFunction }, cache, rest }: FactoryMeta) => {
  if (typeof user !== 'string') {
    const resolved = retrieveFunction('resolveUserId')(user);
    // TODO: Internal errors
    if (!resolved) return null;
    user = resolved;
  }

  let cached: CordisUser | null = null;
  if (useCache && (cached = await cache.get<CordisUser>(CORDIS_REDIS_SYMBOLS.cache.users, user))) {
    return cached;
  }

  const result = await rest.get<APIUser>(`/users/${user}`)
    .then(data => {
      const { data: patched } = Patcher.patchUser(data, cached?.[rawData]);
      return retrieveFunction('sanatizeUser')(patched);
    });

  await cache.set<CordisUser>(CORDIS_REDIS_SYMBOLS.cache.users, user, result);
  return result;
};

export {
  fetchUser
};

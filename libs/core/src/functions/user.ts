import { UserFlags } from '../util/UserFlags';
import { PatchedAPIUser, PatchedAPIClientUser, Snowflake } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { rawData } from '../util/Symbols';
import { User, ClientUser, UserResolvable } from '../Types';

/**
 * Indicates if the given value is or isn't a discord user (sanatized or not)
 */
const isUser = (user: any): user is PatchedAPIUser => (user.flags instanceof UserFlags && user.toString() === `<@${user.id}>`) || (
  'id' in user &&
  'username' in user &&
  'discriminator' in user
);

/**
 * Indicates wether the given value is a sanatized Cordis user or not
 */
const isCordisUser = (user: any): user is User => user.flags instanceof UserFlags && user.toString() === `<@${user.id}>`;

/**
 * Indicates wether the given value is a sanatized Cordis client user or not
 */
const isCordisClientUser = (user: any): user is ClientUser =>
  user.flags instanceof UserFlags && user.toString() === `<@${user.id}>` && 'mfaEnabled' in user && 'verified' in user;

/**
 * Sanatizes a raw Discord user into a Cordis user
 */
const sanatizeUser = (raw: PatchedAPIUser): User => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public_flags,
    ...user
  } = raw;

  return {
    ...user,
    ...Snowflake.getCreationData(user.id),
    flags: new UserFlags(BigInt(public_flags)).freeze(),
    get tag() {
      return `${this.username}#${this.discriminator}`;
    },
    toString() {
      return `<@${this.id}>`;
    },
    [rawData]: raw
  };
};

const sanatizeClientUser = (raw: PatchedAPIClientUser): ClientUser => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { mfa_enabled, verified } = raw;
  const user = sanatizeUser(raw);

  return {
    ...user,
    mfaEnabled: mfa_enabled,
    verified,
    [rawData]: raw
  };
};

/**
 * Attempts to resolve a cordis user from the given value
 */
const resolveUser = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): User | null => {
  if (retrieveFunction('isCordisUser')(user)) return user;
  if (retrieveFunction('isUser')(user)) return retrieveFunction('sanatizeUser')(user);
  return null;
};

/**
 * Attempts to resolve a user id from the given value
 */
const resolveUserId = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveUser')(user)?.id ?? null;

export {
  isUser,
  isCordisUser,
  isCordisClientUser,
  sanatizeClientUser,
  sanatizeUser,
  resolveUser,
  resolveUserId
};

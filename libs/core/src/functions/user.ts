import { UserFlags } from '../util/UserFlags';
import { PatchedAPIUser, PatchedAPIClientUser, Snowflake } from '@cordis/util';
import { rawData } from '../util/Symbols';
import type { FactoryMeta } from '../FunctionManager';
import type { User, ClientUser } from '../types';

/**
 * Indicates if the given value is or isn't a discord user
 */
const isAPIUser = (user: any): user is PatchedAPIUser => 'id' in user && 'username' in user && 'discriminator' in user;

/**
 * Indicates wether the given value is a sanitized Cordis user or not
 */
const isUser = (user: any): user is User => user.flags instanceof UserFlags && user.toString() === `<@${user.id}>`;

/**
 * Indicates wether the given value is a sanitized Cordis client user or not
 */
const isClientUser = (user: any): user is ClientUser =>
  user.flags instanceof UserFlags && user.toString() === `<@${user.id}>` && 'mfaEnabled' in user && 'verified' in user;

/**
 * sanitizes a raw Discord user into a Cordis user
 */
const sanitizeUser = (raw: PatchedAPIUser | User, { functions: { retrieveFunction } }: FactoryMeta): User => {
  if (retrieveFunction('isUser')(raw)) return raw;

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

const sanitizeClientUser = (raw: PatchedAPIClientUser, { functions: { retrieveFunction } }: FactoryMeta): ClientUser => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { mfa_enabled, verified } = raw;
  const user = retrieveFunction('sanitizeUser')(raw);

  return {
    ...user,
    mfaEnabled: mfa_enabled,
    verified,
    [rawData]: raw
  };
};

export {
  isAPIUser,
  isUser,
  isClientUser,
  sanitizeClientUser,
  sanitizeUser
};

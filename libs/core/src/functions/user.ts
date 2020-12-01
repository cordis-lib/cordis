import { APIUser } from 'discord-api-types';
import { UserFlags } from '../util/UserFlags';
import { RequiredProp, Snowflake, SnowflakeEntity } from '@cordis/util';
import { FactoryMeta } from '../util/FunctionManager';

type ExcludedUserProperties = 'email' | 'flags' | 'mfa_enabled' | 'premium_type' | 'verified';

interface PatchedAPIUser extends RequiredProp<Omit<APIUser, ExcludedUserProperties>, 'bot' | 'system' | 'public_flags'> {}
interface CordisUser extends Omit<PatchedAPIUser, 'public_flags'>, SnowflakeEntity {
  flags: UserFlags;
  toString(): string;
}

type UserResolvable = PatchedAPIUser | CordisUser;

/**
 * Indicates if the given value is or isn't a discord user (sanatized or not)
 */
const isUser = (user: any, { functions }: FactoryMeta): user is PatchedAPIUser => functions.retrieveFunction('isCordisUser')(user) || (
  'id' in user &&
  'username' in user &&
  'discriminator' in user
);

/**
 * Indicates wether the given value is a sanatized Cordis user or not
 */
const isCordisUser = (user: any): user is CordisUser => user.flags instanceof UserFlags && user.toString() === `<@${user.id}>`;

/**
 * Sanatizes a raw Discord user into a Cordis user
 */
const sanatizeUser = (raw: PatchedAPIUser): CordisUser => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public_flags,
    ...user
  } = raw;

  return {
    ...user,
    ...Snowflake.getCreationData(user.id),
    flags: new UserFlags(BigInt(public_flags)).freeze(),
    toString() {
      return `<@${this.id}>`;
    }
  };
};

/**
 * Attempts to resolve a cordis user from the given value
 */
const resolveUser = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): CordisUser | null => {
  if (retrieveFunction('isCordisUser')(user)) return user;
  if (retrieveFunction('isUser')(user)) return retrieveFunction('sanatizeUser')(user);
  return null;
};

const resolveUserId = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveUser')(user)?.id ?? null;

export {
  PatchedAPIUser,
  CordisUser,
  UserResolvable,
  isUser,
  isCordisUser,
  sanatizeUser,
  resolveUser,
  resolveUserId
};

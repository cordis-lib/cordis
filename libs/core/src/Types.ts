import { FrozenBitField, PatchedAPIClientUser, PatchedAPIUser, SnowflakeEntity } from '@cordis/util';
import { rawData } from './util/Symbols';
import { UserFlagKeys, UserFlags } from './util/UserFlags';

// Begin cdn types
interface UserAvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin user types
interface User extends Omit<PatchedAPIUser, 'public_flags'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedAPIUser;
}

interface ClientUser extends Omit<PatchedAPIClientUser, 'public_flags' | 'mfa_enabled'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  mfaEnabled: boolean;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedAPIClientUser;
}

type UserResolvable = PatchedAPIUser | User;
// End user types

interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  UserAvatarOptions,
  User,
  ClientUser,
  UserResolvable,

  CoreEvents
};

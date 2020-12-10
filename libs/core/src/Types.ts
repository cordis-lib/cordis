import { FrozenBitField, PatchedClientUser, PatchedUser, SnowflakeEntity } from '@cordis/util';
import { rawData } from './util/Symbols';
import { UserFlagKeys, UserFlags } from './util/UserFlags';

// Begin cdn types
interface AvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin user types
interface CordisUser extends Omit<PatchedUser, 'public_flags'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedUser;
}

interface CordisClientUser extends Omit<PatchedClientUser, 'public_flags' | 'mfa_enabled'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  mfaEnabled: boolean;
  readonly tag: string;
  toString(): string;
  [rawData]: PatchedClientUser;
}

type UserResolvable = PatchedUser | CordisUser;
// End user types

export interface CoreEvents {
  ready: [CordisClientUser];
  userUpdate: [CordisUser, CordisUser];
}

export {
  AvatarOptions,
  CordisUser,
  CordisClientUser,
  UserResolvable
};

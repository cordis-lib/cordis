import { FrozenBitField, PatchedAPIUser, SnowflakeEntity } from '@cordis/util';
import { rawData } from './util/Symbols';
import { UserFlagKeys, UserFlags } from './util/UserFlags';

// Begin cdn types
interface AvatarOptions {
  id: string;
  avatar: string | null;
}
// End cdn types

// Begin user types
interface CordisUser extends Omit<PatchedAPIUser, 'public_flags'>, SnowflakeEntity {
  flags: FrozenBitField<UserFlagKeys, UserFlags>;
  toString(): string;
  readonly tag: string;
  [rawData]: PatchedAPIUser;
}

type UserResolvable = PatchedAPIUser | CordisUser;
// End user types

export {
  AvatarOptions,
  CordisUser,
  UserResolvable
};

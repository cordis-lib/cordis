import type {
  FrozenBitField,
  PatchedAPIClientUser,
  PatchedAPIUser,
  SnowflakeEntity
} from '@cordis/util';
import type { rawData } from '../util/Symbols';
import type { UserFlagKeys, UserFlags } from '../util/UserFlags';

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

export {
  User,
  ClientUser
};

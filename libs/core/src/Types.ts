import {
  FrozenBitField,
  PatchedAPIChannel,
  PatchedAPIClientUser,
  PatchedAPIGuild,
  PatchedAPIInvite,
  PatchedAPIUser,
  SnowflakeEntity
} from '@cordis/util';
import { APIInvite, InviteTargetUserType } from 'discord-api-types';
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

// Begin invite types
interface Invite extends Omit<
APIInvite,
'approximate_member_count' | 'approximate_presence_count' | 'target_user' | 'target_user_type' | 'channel' | 'inviter' | 'guild'
> {
  // TODO: Guild
  guild?: PatchedAPIGuild;
  code: string;
  // TODO: Channel
  channel: PatchedAPIChannel;
  inviter: User;
  memberCount: number | null;
  presenceCount: number | null;
  target: User | null;
  targetType: InviteTargetUserType | null;
  readonly url: string;
  toString(): string;
  [rawData]: PatchedAPIInvite;
}

type InviteResolvable = PatchedAPIInvite | Invite;
// End invite types

interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  UserAvatarOptions,
  User,
  ClientUser,
  UserResolvable,

  Invite,
  InviteResolvable,

  CoreEvents
};

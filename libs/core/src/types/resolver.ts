import type { PatchedAPIGuild, PatchedAPIInvite, PatchedAPIRole, PatchedAPIUser } from '@cordis/util';
import type { Readable } from 'stream';
import type { Guild } from './guild';
import type { Invite } from './invite';
import type { Role } from './role';
import type { User } from './user';

type ColorResolvable = string | number | number[];
type BufferResolvable = Buffer | string;
type FileResolvable = BufferResolvable | Readable;

type GuildResolvable = PatchedAPIGuild | Guild;
type InviteResolvable = PatchedAPIInvite | Invite;
type RoleResolvable = PatchedAPIRole | Role;
type UserResolvable = PatchedAPIUser | User;

export {
  ColorResolvable,
  BufferResolvable,
  FileResolvable,
  GuildResolvable,
  InviteResolvable,
  RoleResolvable,
  UserResolvable
};

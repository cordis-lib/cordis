import type { PatchedAPIChannel, PatchedAPIGuild, PatchedAPIInvite, PatchedAPIMessage, PatchedAPIRole, PatchedAPIUser } from '@cordis/util';
import type { Readable } from 'stream';
import type { Channel } from './channel';
import type { Guild } from './guild';
import type { Invite } from './invite';
import type { Message } from './message';
import type { Role } from './role';
import type { User } from './user';

type ColorResolvable = string | number | number[];
type BufferResolvable = Buffer | string;
type FileResolvable = BufferResolvable | Readable;

type ChannelResolvable = PatchedAPIChannel | Channel;
type GuildResolvable = PatchedAPIGuild | Guild;
type InviteResolvable = PatchedAPIInvite | Invite;
type MessageResolvable = PatchedAPIMessage | Message;
type RoleResolvable = PatchedAPIRole | Role;
type UserResolvable = PatchedAPIUser | User;

export {
  ColorResolvable,
  BufferResolvable,
  FileResolvable,
  ChannelResolvable,
  GuildResolvable,
  InviteResolvable,
  MessageResolvable,
  RoleResolvable,
  UserResolvable
};

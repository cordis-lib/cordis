import type { PatchedAPIInvite } from '@cordis/util';
import type { APIInvite, InviteTargetUserType } from 'discord-api-types';
import type { rawData } from '../util/Symbols';
import type { Channel } from './channel';
import type { Guild } from './guild';
import type { User } from './user';

interface Invite extends Omit<
APIInvite,
'approximate_member_count' | 'approximate_presence_count' | 'target_user' | 'target_user_type' | 'channel' | 'inviter' | 'guild'
> {
  guild: Guild | null;
  code: string;
  channel: Channel;
  inviter: User;
  memberCount: number | null;
  presenceCount: number | null;
  target: User | null;
  targetType: InviteTargetUserType | null;
  readonly url: string;
  toString(): string;
  [rawData]: PatchedAPIInvite;
}

export {
  Invite
};

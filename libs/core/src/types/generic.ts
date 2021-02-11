// ? No place to really put these

import { BitFieldResolvable } from '@cordis/common';
import { OverwriteType } from 'discord-api-types';
import { PermissionKey, Permissions } from '../util/Permissions';
import type { GuildMember } from './guildMember';
import type { ClientUser, User } from './user';

interface VoiceState {
  guildId: string | null;
  channelId: string | null;
  userId: string;
  member: GuildMember | null;
  sessionId: string;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfStream: boolean;
  selfVideo: boolean;
  suppress: boolean;
}

interface Overwrite {
  id: string;
  type: OverwriteType;
  allow: Permissions | BitFieldResolvable<PermissionKey>;
  deny: Permissions | BitFieldResolvable<PermissionKey>;
}

interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  VoiceState,
  Overwrite,
  CoreEvents
};


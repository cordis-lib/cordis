// ? No place to really put these

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

interface CoreEvents {
  ready: [ClientUser];
  userUpdate: [User, User];
}

export {
  VoiceState,
  CoreEvents
};


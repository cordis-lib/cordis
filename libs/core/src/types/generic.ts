// ? No place to really put these

import type { APIGuildMember } from 'discord-api-types';
import type { ClientUser, User } from './user';

interface VoiceState {
  guildId: string | null;
  channelId: string | null;
  userId: string;
  // TODO: Members
  member: APIGuildMember | null;
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


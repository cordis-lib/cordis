import {
  APIEmoji,
  APIGuild,
  APIReaction,
  GatewayReadyDispatch,
  GatewayTypingStartDispatch,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  GatewayWebhooksUpdateDispatch
} from 'discord-api-types';
import {
  PatchedAPIChannel,
  PatchedAPIClientUser,
  PatchedAPIGuild,
  PatchedAPIGuildMember,
  PatchedAPIInvite,
  PatchedAPIMessage,
  PatchedAPIPresence,
  PatchedAPIRole,
  PatchedAPIUser
} from '../struct/Discord';

interface Updated<T> {
  o: T;
  n: T;
}

export interface PatchedReaction extends APIReaction {
  users: string[];
}

export interface Events {
  channelCreate: { guild?: PatchedAPIGuild; channel: PatchedAPIChannel };
  channelDelete: { guild?: PatchedAPIGuild; channel: PatchedAPIChannel };
  channelPinsUpdate: { guild?: PatchedAPIGuild; channel: PatchedAPIChannel; lastPinTimestamp?: string | null };
  channelUpdate: Updated<PatchedAPIChannel> & { guild?: PatchedAPIGuild };

  emojiCreate: { guild: PatchedAPIGuild; emoji: APIEmoji };
  emojiDelete: { guild: PatchedAPIGuild; emoji: APIEmoji };
  emojiUpdate: Updated<APIEmoji> & { guild: PatchedAPIGuild };

  guildIntegrationsUpdate: PatchedAPIGuild;
  guildBanAdd: { guild: PatchedAPIGuild; user: PatchedAPIUser };
  guildBanRemove: { guild: PatchedAPIGuild; user: PatchedAPIUser };
  guildCreate: PatchedAPIGuild;
  guildAvailable: PatchedAPIGuild;
  guildDelete: PatchedAPIGuild;
  guildUnavailable: PatchedAPIGuild;
  guildUpdate: Updated<PatchedAPIGuild>;

  guildMemberAdd: { guild: PatchedAPIGuild; member: PatchedAPIGuildMember };
  guildMemberRemove: { guild: PatchedAPIGuild; member: PatchedAPIGuildMember };
  guildMemberUpdate: Updated<PatchedAPIGuildMember> & { guild: APIGuild };

  roleCreate: { guild: PatchedAPIGuild; role: PatchedAPIRole };
  roleDelete: { guild: PatchedAPIGuild; role: PatchedAPIRole };
  roleUpdate: Updated<PatchedAPIRole> & { guild: PatchedAPIGuild };

  messageCreate: PatchedAPIMessage;
  bulkMessageDelete: PatchedAPIMessage[];
  messageDelete: PatchedAPIMessage;
  messageUpdate: ({ o: PatchedAPIMessage; n: PatchedAPIMessage } | { n: PatchedAPIMessage }) & { guild: APIGuild | null };

  messageReactionAdd: { reaction: PatchedReaction; message: PatchedAPIMessage | null; messageId: string };
  messageReactionRemove: { reaction: PatchedReaction; message: PatchedAPIMessage | null; messageId: string };
  messageReactionRemoveEmoji: { reaction: PatchedReaction; message: PatchedAPIMessage | null; messageId: string };
  messageReactionRemoveAll: { reactions: PatchedReaction[]; message: PatchedAPIMessage | null; messageId: string };

  inviteCreate: PatchedAPIInvite;
  inviteDelete: PatchedAPIInvite;

  presenceUpdate: { n: PatchedAPIPresence; o?: PatchedAPIPresence | null };
  ready: GatewayReadyDispatch['d'] & { user: PatchedAPIClientUser };
  typingStart: GatewayTypingStartDispatch['d'];
  userUpdate: Updated<PatchedAPIUser>;
  voiceServerUpdate: GatewayVoiceServerUpdateDispatch['d'];
  voiceStateUpdate: GatewayVoiceStateUpdateDispatch['d'];
  webhooksUpdate: GatewayWebhooksUpdateDispatch['d'];

  botUserUpdate: Updated<PatchedAPIClientUser>;
}

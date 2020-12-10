import {
  APIEmoji,
  APIGuild,
  APIReaction,
  GatewayInviteCreateDispatch,
  GatewayInviteDeleteDispatch,
  GatewayReadyDispatch,
  GatewayTypingStartDispatch,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  GatewayWebhooksUpdateDispatch
} from 'discord-api-types';
import {
  PatchedChannel,
  PatchedClientUser,
  PatchedGuild,
  PatchedGuildMember,
  PatchedMessage,
  PatchedPresence,
  PatchedRole,
  PatchedUser
} from '../struct/Discord';

interface Updated<T> {
  o: T;
  n: T;
}

export interface PatchedReaction extends APIReaction {
  users: string[];
}

export interface Events {
  channelCreate: { guild?: PatchedGuild; channel: PatchedChannel };
  channelDelete: { guild?: PatchedGuild; channel: PatchedChannel };
  channelPinsUpdate: { guild?: PatchedGuild; channel: PatchedChannel; lastPinTimestamp?: string };
  channelUpdate: Updated<PatchedChannel> & { guild?: PatchedGuild };

  emojiCreate: { guild: PatchedGuild; emoji: APIEmoji };
  emojiDelete: { guild: PatchedGuild; emoji: APIEmoji };
  emojiUpdate: Updated<APIEmoji> & { guild: PatchedGuild };

  guildIntegrationsUpdate: PatchedGuild;
  guildBanAdd: { guild: PatchedGuild; user: PatchedUser };
  guildBanRemove: { guild: PatchedGuild; user: PatchedUser };
  guildCreate: PatchedGuild;
  guildAvailable: PatchedGuild;
  guildDelete: PatchedGuild;
  guildUnavailable: PatchedGuild;
  guildUpdate: Updated<PatchedGuild>;

  guildMemberAdd: { guild: PatchedGuild; member: PatchedGuildMember };
  guildMemberRemove: { guild: PatchedGuild; member: PatchedGuildMember };
  guildMemberUpdate: Updated<PatchedGuildMember> & { guild: APIGuild };

  roleCreate: { guild: PatchedGuild; role: PatchedRole };
  roleDelete: { guild: PatchedGuild; role: PatchedRole };
  roleUpdate: Updated<PatchedRole> & { guild: PatchedGuild };

  messageCreate: PatchedMessage;
  bulkMessageDelete: PatchedMessage[];
  messageDelete: PatchedMessage;
  messageUpdate: ({ o: PatchedMessage; n: PatchedMessage } | { n: PatchedMessage }) & { guild: APIGuild | null };

  messageReactionAdd: { reaction: PatchedReaction; message: PatchedMessage | null; messageId: string };
  messageReactionRemove: { reaction: PatchedReaction; message: PatchedMessage | null; messageId: string };
  messageReactionRemoveEmoji: { reaction: PatchedReaction; message: PatchedMessage | null; messageId: string };
  messageReactionRemoveAll: { reactions: PatchedReaction[]; message: PatchedMessage | null; messageId: string };

  inviteCreate: { guild: PatchedGuild; invite: GatewayInviteCreateDispatch['d'] };
  inviteDelete: { guild: PatchedGuild; invite: GatewayInviteDeleteDispatch['d'] };

  presenceUpdate: { n: PatchedPresence; o?: PatchedPresence | null };
  ready: GatewayReadyDispatch['d'] & { user: PatchedClientUser };
  typingStart: GatewayTypingStartDispatch['d'];
  userUpdate: Updated<PatchedUser>;
  voiceServerUpdate: GatewayVoiceServerUpdateDispatch['d'];
  voiceStateUpdate: GatewayVoiceStateUpdateDispatch['d'];
  webhooksUpdate: GatewayWebhooksUpdateDispatch['d'];

  botUserUpdate: Updated<PatchedClientUser>;
}

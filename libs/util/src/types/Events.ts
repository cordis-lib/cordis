import {
  APIChannel,
  APIGuild,
  APIEmoji,
  APIReaction,
  APIGuildMember,
  APIUser,
  APIMessage,
  APIRole,
  GatewayGuildRoleUpdateDispatch,
  GatewayPresenceUpdate,
  GatewayReadyDispatch,
  GatewayTypingStartDispatch,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  GatewayWebhooksUpdateDispatch,
  GatewayInviteCreateDispatch,
  GatewayInviteDeleteDispatch
} from 'discord-api-types';

interface Updated<T> {
  o: T;
  n: T;
}

export interface CordisReaction extends APIReaction {
  users: string[];
}

export interface Events {
  channelCreate: { guild?: APIGuild; channel: APIChannel };
  channelDelete: { guild?: APIGuild; channel: APIChannel };
  channelPinsUpdate: { guild?: APIGuild; channel: APIChannel; lastPinTimestamp?: string };
  channelUpdate: Updated<APIChannel> & { guild?: APIGuild };

  emojiCreate: { guild: APIGuild; emoji: APIEmoji };
  emojiDelete: { guild: APIGuild; emoji: APIEmoji };
  emojiUpdate: Updated<APIEmoji> & { guild: APIGuild };

  guildIntegrationsUpdate: APIGuild;
  guildBanAdd: { guild: APIGuild; user: APIUser };
  guildBanRemove: { guild: APIGuild; user: APIUser };
  guildCreate: APIGuild;
  guildAvailable: APIGuild;
  guildDelete: APIGuild;
  guildUnavailable: APIGuild;
  guildUpdate: Updated<APIGuild>;

  guildMemberAdd: { guild: APIGuild; member: APIGuildMember };
  guildMemberRemove: { guild: APIGuild; member: APIGuildMember };
  guildMemberUpdate: Updated<APIGuildMember> & { guild: APIGuild };

  roleCreate: { guild: APIGuild; role: APIRole };
  roleDelete: { guild: APIGuild; role: APIRole };
  roleUpdate: Updated<GatewayGuildRoleUpdateDispatch['d']> & { guild: APIGuild };

  messageCreate: APIMessage;
  bulkMessageDelete: APIMessage[];
  messageDelete: APIMessage;
  messageUpdate: ({ o: APIMessage; n: APIMessage } | { n: Partial<APIMessage> }) & { guild: APIGuild | null };

  messageReactionAdd: { reaction: CordisReaction; message: APIMessage | null; messageId: string };
  messageReactionRemove: { reaction: CordisReaction; message: APIMessage | null; messageId: string };
  messageReactionRemoveEmoji: { reaction: CordisReaction; message: APIMessage | null; messageId: string };
  messageReactionRemoveAll: { reactions: CordisReaction[]; message: APIMessage | null; messageId: string };

  inviteCreate: { guild: APIGuild; invite: GatewayInviteCreateDispatch['d'] };
  inviteDelete: { guild: APIGuild; invite: GatewayInviteDeleteDispatch['d'] };

  presenceUpdate: { n: GatewayPresenceUpdate; o?: GatewayPresenceUpdate | null };
  ready: GatewayReadyDispatch['d'];
  typingStart: GatewayTypingStartDispatch['d'];
  userUpdate: Updated<APIUser>;
  voiceServerUpdate: GatewayVoiceServerUpdateDispatch['d'];
  voiceStateUpdate: GatewayVoiceStateUpdateDispatch['d'];
  webhooksUpdate: GatewayWebhooksUpdateDispatch['d'];

  botUserUpdate: Updated<APIUser>;
}

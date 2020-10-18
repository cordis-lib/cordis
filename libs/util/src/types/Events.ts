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
  GatewayPresenceUpdateData,
  GatewayReadyDispatch,
  GatewayTypingStartDispatch,
  GatewayVoiceServerUpdateDispatch,
  GatewayVoiceStateUpdateDispatch,
  GatewayWebhooksUpdateDispatch
} from 'discord-api-types';

interface Updated<T> {
  o: T;
  n: T;
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
  guildDelete: APIGuild;
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
  messageUpdate: { o: APIMessage; n: Partial<APIMessage> };

  messageReactionAdd: { emoji: APIEmoji; message: APIMessage; user: APIUser | null };
  messageReactionRemove: { emoji: APIEmoji; message: APIMessage; user: APIUser | null };
  messageReactionRemoveEmoji: { emoji: APIEmoji; message: APIMessage };
  messageReactionRemoveAll: { reactions: APIReaction[]; message: APIMessage };

  presenceUpdate: GatewayPresenceUpdateData;
  ready: GatewayReadyDispatch['d'];
  typingStart: GatewayTypingStartDispatch['d'];
  userUpdate: Updated<APIUser>;
  voiceServerUpdate: GatewayVoiceServerUpdateDispatch['d'];
  voiceStateUpdate: GatewayVoiceStateUpdateDispatch['d'];
  webhooksUpdate: GatewayWebhooksUpdateDispatch['d'];

  botUserUpdate: Updated<APIUser>;
}

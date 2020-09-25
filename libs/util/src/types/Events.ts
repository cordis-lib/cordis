import {
  Channel,
  ChannelPinsUpdateData,
  Guild,
  BanData,
  Emoji,
  ReadyData,
  GuildMemberAddData,
  GuildMemberRemoveData,
  Member,
  GuildIntegrationsUpdateData,
  RoleData,
  Message,
  User,
  Reaction,
  PresenceUpdateData,
  TypingStartData,
  VoiceServerUpdateData,
  VoiceState,
  WebhookUpdateData
} from '@cordis/types';

interface Updated<T> {
  o: T;
  n: T;
}

export interface Events {
  channelCreate: Channel;
  channelDelete: Channel;
  channelPinsUpdate: ChannelPinsUpdateData;
  channelUpdate: Updated<Channel>;

  emojiCreate: Emoji;
  emojiDelete: Emoji;
  emojiUpdate: Updated<Emoji>;

  guildIntegrationsUpdate: GuildIntegrationsUpdateData;
  guildBanAdd: BanData;
  guildBanRemove: BanData;
  guildCreate: Guild;
  guildDelete: Guild;
  guildUpdate: Updated<Guild>;

  guildMemberAdd: GuildMemberAddData;
  guildMemberRemove: GuildMemberRemoveData;
  guildMemberUpdate: Updated<Member>;

  roleCreate: RoleData;
  roleDelete: RoleData;
  roleUpdate: Updated<RoleData>;

  messageCreate: Message;
  bulkMessageDelete: Message[];
  messageDelete: Message;
  messageUpdate: { o: Message; n: Partial<Message> };

  messageReactionAdd: { emoji: Emoji; message: Message; user: User | null };
  messageReactionRemove: { emoji: Emoji; message: Message; user: User | null };
  messageReactionRemoveEmoji: { emoji: Emoji; message: Message };
  messageReactionRemoveAll: { reactions: Reaction[]; message: Message };

  presenceUpdate: PresenceUpdateData;
  ready: ReadyData;
  typingStart: TypingStartData;
  userUpdate: Updated<User>;
  voiceServerUpdate: VoiceServerUpdateData;
  voiceStateUpdate: VoiceState;
  webhooksUpdate: WebhookUpdateData;

  botUserUpdate: Updated<User>;
}

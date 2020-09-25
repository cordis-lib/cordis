/* eslint-disable @typescript-eslint/naming-convention */

export type Snowflake = string;
export type ISOTimestamp = string;

// #Resources
export interface AuditLogEntry {
  target_id: string | null;
  changes?: AuditLogChange[];
  user_id: Snowflake;
  id: Snowflake;
  action_type: AuditLogEvents;
  options?: OptionalAuditEntryInfo;
  reason?: string;
}

export enum AuditLogEvents {
  guildCreate = 1,

  channelCreate = 10,
  channelUpdate = 11,
  channelDelete = 12,
  channelOverwriteCreate = 13,
  channelOverwriteUpodate = 14,
  channelOverwriteDelete = 15,

  memberKick = 20,
  memberPrune = 21,
  memberBanAdd = 22,
  memberBanRemove = 23,
  memberUpdate = 24,
  memberRoleUpdate = 25,
  memberMove = 26,
  memberDisconnect = 27,
  botAdd = 28,

  roleCreate = 30,
  roleUpdate = 31,
  roleDelete = 32,

  inviteCreate = 40,
  inviteUpdate = 41,
  inviteDelete = 42,

  webhookCreate = 50,
  webhookUpdate = 51,
  webhookDelete = 52,

  emojiCreate = 60,
  emojiUpdate = 61,
  emojiDelete = 62,

  messageDelete = 72,
  messageBulkDelete = 73,
  messagePin = 74,
  messageUnpin = 75,

  integrationCreate = 80,
  integrationUpdate = 81,
  integrationDelete = 82
}

export type OptionalAuditEntryInfo = Partial<{
  delete_member_days: string;
  members_removed: string;
  channel_id: Snowflake;
  message_id: Snowflake;
  count: string;
  id: Snowflake;
  type: 'member' | 'role';
  role_name: string;
}>;

export type AuditLogChange =
  | AuditLogChangeType<'name', string>
  | AuditLogChangeType<'icon_Hash', string>
  | AuditLogChangeType<'splash_Hash', string>
  | AuditLogChangeType<'owner_id', Snowflake>
  | AuditLogChangeType<'region', string>
  | AuditLogChangeType<'afk_channel_id', Snowflake>
  | AuditLogChangeType<'afk_Timeout', number>
  | AuditLogChangeType<'mfa_Level', MFALevel>
  | AuditLogChangeType<'verification_Level', number>
  | AuditLogChangeType<'explicit_Content_Filter', ExplicitContentFilterLevel>
  | AuditLogChangeType<'default_Message_Notifications', number>
  | AuditLogChangeType<'vanity_Url_Code', string>
  | AuditLogChangeType<'$add', Partial<Role>[]>
  | AuditLogChangeType<'$remove', Partial<Role>[]>
  | AuditLogChangeType<'prune_Delete_Days', number>
  | AuditLogChangeType<'widget_Enabled', boolean>
  | AuditLogChangeType<'widget_channel_id', Snowflake>
  | AuditLogChangeType<'system_channel_id', Snowflake>

  | AuditLogChangeType<'position', number>
  | AuditLogChangeType<'topic', string>
  | AuditLogChangeType<'bitrate', number>
  | AuditLogChangeType<'permission_Overwrites', Overwrite[]>
  | AuditLogChangeType<'nsfw', boolean>
  | AuditLogChangeType<'application_id', Snowflake>
  | AuditLogChangeType<'rate_Limit_Per_User', number>

  | AuditLogChangeType<'permissions', number>
  | AuditLogChangeType<'color', number>
  | AuditLogChangeType<'hoist', boolean>
  | AuditLogChangeType<'mentionable', boolean>
  | AuditLogChangeType<'allow', number>
  | AuditLogChangeType<'deny', number>

  | AuditLogChangeType<'code', string>
  | AuditLogChangeType<'channel_id', Snowflake>
  | AuditLogChangeType<'inviter_Id', Snowflake>
  | AuditLogChangeType<'max_Uses', number>
  | AuditLogChangeType<'uses', number>
  | AuditLogChangeType<'max_Age', number>
  | AuditLogChangeType<'temporary', boolean>

  | AuditLogChangeType<'deaf', boolean>
  | AuditLogChangeType<'mute', boolean>
  | AuditLogChangeType<'nick', string>
  | AuditLogChangeType<'avatar_Hash', string>

  | AuditLogChangeType<'id', Snowflake>
  | AuditLogChangeType<'type', number>

  | AuditLogChangeType<'enable_Emoticons', boolean>
  | AuditLogChangeType<'expire_Behavior', number>
  | AuditLogChangeType<'expire_Grace_Period', number>;

export interface AuditLogChangeType<K extends string, T> {
  key: K;
  old_value?: T;
  new_value?: T;
}

export interface AuditLog {
  webhooks: Webhook[];
  users: User[];
  audit_log_entries: AuditLogEntry[];
  integrations: Partial<Integration>[];
}

export interface Overwrite {
  id: Snowflake;
  type: 'role' | 'member';
  allow: number;
  deny: number;
}

export interface ChannelMention {
  id: Snowflake;
  guild_id: Snowflake;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
}

export enum MessageType {
  default,
  recipientAdd,
  recipientRemove,
  call,
  channelNameChange,
  channelIconChange,
  channelPinnedMessage,
  guildMemberJoin,
  userPremiumGuildSubscription,
  userPremiumGuildSubscriptionTierOne,
  userPremiumGuildSubscriptionTierTwo,
  userPremiumGuildSubscriptionTierThree,
  channelFollowAdd
}

export interface MessageActivity {
  type: MessageActivityType;
  party_id?: string;
}

export interface MessageApplication {
  id: Snowflake;
  cover_Image?: string;
  descripton: string;
  icon: string | null;
  name: string;
}

export interface MessageReference {
  message_id?: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

export enum MessageActivityType {
  join = 1,
  spectate = 2,
  listen = 3,
  joinRequest = 4
}

export interface Reaction {
  count: number;
  me: boolean;
  emoji: Emoji;
}

export type EmbedThumbnail = Partial<{
  url: string;
  proxy_url: string;
  height: number;
  width: number;
}>;

export type EmbedVideo = Partial<{
  url: string;
  height: number;
  width: number;
}>;

export type EmbedImage = Partial<{
  url: string;
  proxy_url: string;
  height: number;
  width: number;
}>;

export type EmbedProvider = Partial<{
  name: string;
  url: string;
}>;

export type EmbedAuthor = Partial<{
  name: string;
  url: string;
  icon_url: string;
  proxy_icon_url: string;
}>;

export type EmbedFooter = Partial<{
  text: string;
  icon_url: string;
  proxy_icon_url: string;
}>;

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export type Embed = Partial<{
  title: string;
  type: string;
  description: string;
  url: string;
  timestamp: ISOTimestamp;
  color: number;
  footer: EmbedFooter;
  image: EmbedImage;
  thumbnail: EmbedThumbnail;
  video: EmbedVideo;
  provider: EmbedProvider;
  author: EmbedAuthor;
  fields: EmbedField[];
}>;

export interface Attachment {
  id: Snowflake;
  filename: string;
  size: number;
  url: string;
  proxy_url: string;
  height: number | null;
  width: number | null;
}

export interface Message {
  id: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake;
  author: User | WebhookUser;
  member?: Member;
  content: string;
  timestamp: ISOTimestamp;
  edited_timestamp: ISOTimestamp | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: (User & { member: Partial<Member> })[];
  mention_roles: Snowflake[];
  mention_channels?: ChannelMention[];
  attachments: Attachment[];
  embeds: Embed[];
  reactions?: Reaction[];
  nonce?: number | string;
  pinned: boolean;
  webhook_id?: Snowflake;
  type: MessageType;
  activity?: MessageActivity;
  application?: MessageApplication;
  message_reference?: MessageReference;
  flags?: number;
}

export interface BaseChannel {
  id: Snowflake;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface DMChannel extends BaseChannel {
  type: 1;
  icon: string | null;
  owner_id: Snowflake;
  last_message_id: Snowflake | null;
  recipients: User[];
  last_pin_timestamp?: ISOTimestamp;
}

export interface GroupDMChannel extends Omit<DMChannel, 'type'> {
  type: 3;
  application_id?: Snowflake;
}

export interface GuildChannel extends BaseChannel {
  type: 0 | 2 | 4 | 5 | 6;
  guild_id: Snowflake;
  name: string;
  nsfw: boolean;
  position: number;
  permission_overwrites: Overwrite[];
  parent_id: Snowflake | null;
}

export interface TextChannel extends GuildChannel {
  type: 0;
  topic: string | null;
  last_message_id: Snowflake | null;
  rate_limit_per_user: number;
  last_pin_timestamp?: ISOTimestamp;
}

export interface VoiceChannel extends GuildChannel {
  type: 2;
  birate: number;
  user_limit: number;
}

export interface CategoryChannel extends GuildChannel {
  type: 4;
}

export interface NewsChannel extends GuildChannel {
  type: 5;
}

export interface StoreChannel extends GuildChannel {
  type: 6;
}

export type Channel = DMChannel | GroupDMChannel | TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;

export type Emoji = {
  id: Snowflake | null;
  name: string | null;
} & Partial<{
  roles: Snowflake[];
  user: User;
  require_colons: boolean;
  managed: boolean;
  animated: boolean;
}>;

export enum DefaultMessageNotificationsLevel {
  allMessages,
  onlyMentions
}

export enum ExplicitContentFilterLevel {
  disabled,
  membersWithoutRoles,
  allMembers
}

export enum MFALevel {
  none,
  elevated
}

export enum VerificationLevel {
  none,
  low,
  medium,
  high,
  veryHigh
}

export enum PremiumTier {
  none,
  tierOne,
  tierTwo,
  tierThree
}

export type GuildFeatures =
| 'INVITE_SPLASH'
| 'VIP_REGIONS'
| 'VANITY_URL'
| 'VERIFIED'
| 'PARTNERED'
| 'PUBLIC'
| 'COMMERCE'
| 'NEWS'
| 'DISCOVERABLE'
| 'FEATURABLE'
| 'ANIMATED_ICON'
| 'BANNER';

export interface GuildEmbed {
  enabled: boolean;
  channel_id: Snowflake | null;
}

export interface Integration {
  id: Snowflake;
  name: string;
  type: string;
  enabled: boolean;
  syncing: boolean;
  role_id: Snowflake;
  expire_behavior: number;
  expire_grace_period: number;
  user: User;
  account: IntegrationAccount;
  synced_at: ISOTimestamp;
}

export interface IntegrationAccount {
  id: Snowflake;
  name: string;
}

export interface Ban {
  reason: string | null;
  user: User;
}

export interface Role {
  id: Snowflake;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: number;
  managed: boolean;
  mentionable: boolean;
}

export interface Member {
  user: User;
  nick?: string;
  roles: Snowflake[];
  joined_at: ISOTimestamp;
  premium_since?: ISOTimestamp | null;
  deaf: boolean;
  mute: boolean;
}

export interface AvailableGuild {
  id: Snowflake;
  name: string;
  icon: string | null;
  splash: string | null;
  owner?: boolean;
  owner_id: Snowflake;
  permissions?: number;
  region: string;
  afk_channel_id: Snowflake | null;
  afk_timeout: number;
  embed_enabled?: boolean;
  embed_channel_id?: Snowflake;
  verification_level: VerificationLevel;
  default_message_notifications: DefaultMessageNotificationsLevel;
  explicit_content_filter: ExplicitContentFilterLevel;
  roles: Role[];
  emojis: Emoji[];
  features: GuildFeatures[];
  mfa_level: MFALevel;
  application_id: Snowflake | null;
  widget_enabled?: boolean;
  widget_channel_id?: Snowflake | null;
  joined_at?: ISOTimestamp;
  large?: boolean;
  unavailable: boolean;
  member_count?: number;
  voice_states?: Partial<VoiceState>[];
  members?: Member[];
  channels?: Channel[];
  presences?: Partial<PresenceUpdateData>[];
  max_presences?: number | null;
  max_members?: number;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: PremiumTier;
  premium_subscription_count?: number;
  preferred_locale: string;
}

export interface UnavailableGuild {
  id: Snowflake;
  unavailable: boolean;
}

export type Guild = AvailableGuild & UnavailableGuild;

export enum TargetUserType {
  stream = 1
}

export interface InviteMetadata {
  inviter: User;
  uses: number;
  max_uses: number;
  max_age: number;
  temporary: boolean;
  created_at: ISOTimestamp;
}

export interface Invite {
  code: string;
  guild?: Partial<Guild>;
  channel: Partial<Channel>;
  target_user?: Partial<User>;
  target_user_type?: TargetUserType;
  approximate_presence_count?: number;
  approximate_member_count?: number;
}

export enum PremiumType {
  nitroClassic = 1,
  nitro = 2
}

export interface WebhookUser {
  id: Snowflake;
  username: string;
  avatar: string | null;
}

export interface User {
  id: Snowflake;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: string;
  premium_type?: PremiumType;
}

export interface VoiceState {
  guild_id?: Snowflake;
  channel_id: Snowflake;
  user_id: Snowflake;
  member?: Member;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  suppress: boolean;
}

export interface VoiceRegion {
  id: string;
  name: string;
  vip: boolean;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

export enum WebhookTypes {
  incoming = 1,
  channelFollower = 2
}

export interface Webhook {
  id: Snowflake;
  type: number;
  guild_id?: Snowflake;
  channel_id: Snowflake;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
}

// #Gateway
export enum OpCodes {
  dispatch = 0,
  heartbeat = 1,
  identify = 2,
  presenceUpdate = 3,
  voiceStateUpdate = 4,
  resume = 6,
  reconnect = 7,
  requestGuildMembers = 8,
  invalidSession = 9,
  hello = 10,
  heartbeatAck = 11
}

export type CommandOpCodes =
  | OpCodes.heartbeat
  | OpCodes.identify
  | OpCodes.presenceUpdate
  | OpCodes.voiceStateUpdate
  | OpCodes.resume
  | OpCodes.requestGuildMembers;

// Can also recieve Heartbeat OP
export type EventOpCodes = Exclude<OpCodes, CommandOpCodes> | OpCodes.heartbeat;

export type Dispatch =
  | 'CHANNEL_CREATE'
  | 'CHANNEL_DELETE'
  | 'CHANNEL_PINS_UPDATE'
  | 'CHANNEL_UPDATE'

  | 'GUILD_CREATE'
  | 'GUILD_DELETE'
  | 'GUILD_UPDATE'
  | 'GUILD_BAN_ADD'
  | 'GUILD_BAN_REMOVE'
  | 'GUILD_EMOJIS_UPDATE'
  | 'GUILD_INTEGRATIONS_UPDATE'
  | 'GUILD_MEMBER_ADD'
  | 'GUILD_MEMBER_UPDATE'
  | 'GUILD_MEMBER_REMOVE'
  | 'GUILD_MEMBERS_CHUNK'
  | 'GUILD_ROLE_CREATE'
  | 'GUILD_ROLE_DELETE'
  | 'GUILD_ROLE_UPDATE'

  | 'MESSAGE_CREATE'
  | 'MESSAGE_DELETE'
  | 'MESSAGE_DELETE_BULK'
  | 'MESSAGE_REACTION_ADD'
  | 'MESSAGE_REACTION_REMOVE'
  | 'MESSAGE_REACTION_REMOVE_EMOJI'
  | 'MESSAGE_REACTION_REMOVE_ALL'
  | 'MESSAGE_UPDATE'

  | 'PRESENCE_UPDATE'

  | 'READY'
  | 'RESUMED'
  | 'RECONNECT'

  | 'TYPING_START'
  | 'USER_UPDATE'

  | 'VOICE_STATE_UPDATE'
  | 'VOICE_SERVER_UPDATE'

  | 'WEBHOOKS_UPDATE';

export interface Payload<T, O extends OpCodes, D extends Dispatch> {
  op: O;
  d: T;
  s?: number | null;
  t?: D | null;
}

export interface EventPayload<T, D extends Dispatch, O extends EventOpCodes = OpCodes.dispatch> extends Payload<T, O, D> {
  s: number | null;
  t: D | null;
}

export interface DispatchPayload<T, D extends Dispatch> extends EventPayload<T, D> {
  s: number;
  t: D;
}

export type CommandPayload<T, O extends CommandOpCodes> = Omit<Payload<T, O, never>, 's' | 't'>;


export interface HelloData {
  heartbeat_interval: number;
}

export interface ReadyData {
  v: number;
  user: User;
  private_channels: Channel[];
  guilds: UnavailableGuild[];
  session_id: string;
  shard?: [number, number];
}

export interface ChannelPinsUpdateData {
  channel_id: string;
  last_pin_timestamp?: string;
}

export interface BanData {
  guild_id: Snowflake;
  user: User;
}

export interface GuildEmojisUpdateData {
  guild_id: Snowflake;
  emojis: Emoji[];
}

export interface GuildIntegrationsUpdateData {
  guild_id: Snowflake;
}

export type GuildMemberAddData = Member & { guild_id: Snowflake };

export interface GuildMemberRemoveData {
  guild_id: Snowflake;
  user: User;
}

export interface GuildMemberUpdateData {
  guild_id: Snowflake;
  roles: Snowflake[];
  user: User;
  nick: string;
}

export interface GuildMembersChunkData {
  guild_id: Snowflake;
  members: Member[];
  not_found?: string[];
  presences?: PresenceUpdateData[];
}

export interface RoleData {
  guild_id: Snowflake;
  role: Role;
}

export interface GuildRoleDeleteData {
  guild_id: Snowflake;
  role_id: Snowflake;
}

export interface MessageBulkDeleteData {
  ids: Snowflake[];
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

export interface BaseReactionData {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  emoji: Emoji;
}

export type MessageReactionRemoveEmojiData = Omit<BaseReactionData, 'user_id'>;

export interface MessageReactionRemoveAllData {
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
}

export interface ClientStatus {
  desktop?: string;
  mobile?: string;
  web?: string;
}

export interface Activity {
  name: string;
  type: ActivityTypes;
  url?: string | null;
  created_at: number;
  timestamps?: ActivityTimestamps;
  application_id?: Snowflake;
  details?: string | null;
  state?: string | null;
  emoji?: Emoji | null;
  party?: ActivityParty;
  assets?: ActivityAssets;
  secrets?: ActivitySecrets;
  instance?: boolean;
  flags: number;
}

export enum ActivityTypes {
  game,
  streaming,
  listening,
  custom
}

export interface ActivityTimestamps {
  start?: number;
  end?: number;
}

export interface ActivityEmoji {
  name: string;
  id?: Snowflake;
  animated?: boolean;
}

export interface ActivityParty {
  id?: string;
  size: [number, number];
}

export interface ActivityAssets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface ActivitySecrets {
  join?: string;
  spectate?: string;
  match?: string;
}

export type PresenceStatus = 'idle' | 'dnd' | 'online' | 'offline';
export type ClientPresenceStatus = 'online' | 'idle' | 'dnd';

export interface PresenceUpdateData {
  user: User;
  roles: Snowflake[];
  game: Activity | null;
  guild_id: Snowflake;
  status: PresenceStatus;
  activities: Activity[];
  client_status: ClientPresenceStatus | ClientStatus;
  premium_since?: ISOTimestamp | null;
  nick?: string | null;
}

export interface TypingStartData {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  user_id: Snowflake;
  timestamp: number;
  member?: Member;
}

export interface VoiceServerUpdateData {
  token: string;
  guild_id: Snowflake;
  endpoint: string;
}

export interface WebhookUpdateData {
  guild_id: Snowflake;
  channel_id: Snowflake;
}

declare interface BaseMessage {
  id: Snowflake;
  channel_id: Snowflake;
}

export type MessageReactionAddData = BaseReactionData & { member?: Member };

// * Client
export type HeartbeatEvent = EventPayload<never, never, OpCodes.heartbeat>;
export type InvalidSession = EventPayload<boolean, never, OpCodes.invalidSession>;
export type Hello = EventPayload<HelloData, never, OpCodes.hello>;
export type Reconnect = EventPayload<boolean, never, OpCodes.reconnect>;
export type HeartbeatACK = EventPayload<never, never, OpCodes.heartbeatAck>;
export type Ready = DispatchPayload<ReadyData, 'READY'>;
export type Resumed = DispatchPayload<never, 'RESUMED'>;

// * Channel
export type ChannelCreate = DispatchPayload<Channel, 'CHANNEL_CREATE'>;
export type ChannelUpdate = DispatchPayload<Channel, 'CHANNEL_DELETE'>;
export type ChannelDelete = DispatchPayload<Channel, 'CHANNEL_UPDATE'>;
export type ChannelPinsUpdate = DispatchPayload<ChannelPinsUpdateData, 'CHANNEL_PINS_UPDATE'>;

// * Guild
export type GuildCreate = DispatchPayload<Guild, 'GUILD_CREATE'>;
export type GuildUpdate = DispatchPayload<Guild, 'GUILD_UPDATE'>;
export type GuildDelete = DispatchPayload<Guild, 'GUILD_DELETE'>;

export type GuildBanAdd = DispatchPayload<BanData, 'GUILD_BAN_ADD'>;
export type GuildBanRemove = DispatchPayload<BanData, 'GUILD_BAN_REMOVE'>;
export type GuildEmojisUpdate = DispatchPayload<GuildEmojisUpdateData, 'GUILD_EMOJIS_UPDATE'>;
export type GuildIntegrationsUpdate = DispatchPayload<GuildIntegrationsUpdateData, 'GUILD_INTEGRATIONS_UPDATE'>;

export type GuildMemberAdd = DispatchPayload<GuildMemberAddData, 'GUILD_MEMBER_ADD'>;
export type GuildMemberRemove = DispatchPayload<GuildMemberRemoveData, 'GUILD_MEMBER_REMOVE'>;
export type GuildMemberUpdate = DispatchPayload<GuildMemberUpdateData, 'GUILD_MEMBER_UPDATE'>;
export type GuildMembersChunk = DispatchPayload<GuildMembersChunkData, 'GUILD_MEMBERS_CHUNK'>;

export type GuildRoleCreate = DispatchPayload<RoleData, 'GUILD_ROLE_CREATE'>;
export type GuildRoleUpdate = DispatchPayload<RoleData, 'GUILD_ROLE_UPDATE'>;
export type GuildRoleDelete = DispatchPayload<GuildRoleDeleteData, 'GUILD_ROLE_DELETE'>;

// * Messages
export type MessageCreate = DispatchPayload<Message, 'MESSAGE_CREATE'>;

export type MessageUpdateData = BaseMessage & Partial<Message>;
export type MessageUpdate = DispatchPayload<MessageUpdateData, 'MESSAGE_UPDATE'>;

export type MessageDeleteData = BaseMessage & { guild_id?: Snowflake };
export type MessageDelete = DispatchPayload<MessageDeleteData, 'MESSAGE_DELETE'>;
export type MessageBulkDelete = DispatchPayload<MessageBulkDeleteData, 'MESSAGE_DELETE_BULK'>;

export type MessageReactionAdd = DispatchPayload<MessageReactionAddData, 'MESSAGE_REACTION_ADD'>;
export type MessageReactionRemove = DispatchPayload<BaseReactionData, 'MESSAGE_REACTION_REMOVE'>;
export type MessageReactionRemoveEmoji = DispatchPayload<MessageReactionRemoveEmojiData, 'MESSAGE_REACTION_REMOVE_EMOJI'>;
export type MessageReactionRemoveAll = DispatchPayload<MessageReactionRemoveAllData, 'MESSAGE_REACTION_REMOVE_ALL'>;

// * Presence
export type PresenceUpdate = DispatchPayload<PresenceUpdateData, 'PRESENCE_UPDATE'>;
export type TypingStart = DispatchPayload<TypingStartData, 'TYPING_START'>;
export type UserUpdate = DispatchPayload<User, 'USER_UPDATE'>;

// * Voice
export type VoiceStateUpdate = DispatchPayload<VoiceState, 'VOICE_STATE_UPDATE'>;
export type VoiceServerUpdate = DispatchPayload<VoiceServerUpdateData, 'VOICE_SERVER_UPDATE'>;

// * Webhooks
export type WebhookUpdate = DispatchPayload<WebhookUpdateData, 'WEBHOOKS_UPDATE'>;

export type DispatchEvent =
  | Ready
  | Resumed
  | ChannelCreate
  | ChannelUpdate
  | ChannelDelete
  | ChannelPinsUpdate
  | GuildCreate
  | GuildUpdate
  | GuildDelete
  | GuildBanAdd
  | GuildBanRemove
  | GuildEmojisUpdate
  | GuildIntegrationsUpdate
  | GuildMemberAdd
  | GuildMemberRemove
  | GuildMemberUpdate
  | GuildMembersChunk
  | GuildRoleCreate
  | GuildRoleUpdate
  | GuildRoleDelete
  | MessageCreate
  | MessageUpdate
  | MessageDelete
  | MessageBulkDelete
  | MessageReactionAdd
  | MessageReactionRemove
  | MessageReactionRemoveEmoji
  | MessageReactionRemoveAll
  | PresenceUpdate
  | TypingStart
  | UserUpdate
  | VoiceStateUpdate
  | VoiceServerUpdate
  | WebhookUpdate;

export type DiscordEvent =
  | DispatchEvent
  | HeartbeatEvent
  | Reconnect
  | InvalidSession
  | Hello
  | HeartbeatACK;

// ! Commands
export interface IdentifyConnectionProperties {
  $os: string;
  $browser: string;
  $device: string;
}

export interface IdentifyData {
  token: string;
  properties: IdentifyConnectionProperties;
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: PresenceUpdateData;
}

export interface ResumseData {
  token: string;
  session_id: string;
  seq: number;
}

export type HeartbeatCommandData = number | null;

export interface RequestGuildMembersData {
  guild_id: Snowflake | Snowflake[];
  query?: string;
  limit: number;
  presences?: boolean;
  user_ids?: Snowflake | Snowflake[];
}

export interface UpdateVoiceStateData {
  guild_id: Snowflake;
  channel_id: Snowflake | null;
  self_mute: boolean;
  self_deaf: boolean;
}

export type StatusType = 'online' | 'dnd' | 'idle' | 'invisible' | 'offline';
export interface PresenceUpdateCommandData {
  since: number | null;
  game: Activity | null;
  status: StatusType;
  afk: boolean;
}

export type IdentifyPayload = CommandPayload<IdentifyData, OpCodes.identify>;
export type ResumePayload = CommandPayload<ResumseData, OpCodes.resume>;
export type HeartbeatPayload = CommandPayload<HeartbeatCommandData, OpCodes.heartbeat>;
export type RequestGuildMembersPayload = CommandPayload<RequestGuildMembersData, OpCodes.requestGuildMembers>;
export type UpdateVoiceStatePayload = CommandPayload<UpdateVoiceStateData, OpCodes.voiceStateUpdate>;
export type PresenceUpdatePayload = CommandPayload<PresenceUpdateCommandData, OpCodes.presenceUpdate>;

export type DiscordCommand =
  | IdentifyPayload
  | ResumePayload
  | HeartbeatPayload
  | RequestGuildMembersPayload
  | UpdateVoiceStatePayload
  | PresenceUpdatePayload;

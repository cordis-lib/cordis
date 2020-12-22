import type {
  APIAttachment,
  APIMessageActivity,
  APIMessageApplication,
  APIReaction,
  APISticker,
  ChannelType,
  MessageFlags,
  MessageType,
  StickerFormatType
} from 'discord-api-types';
import type { PatchedAPIMessage, SnowflakeEntity } from '@cordis/util';
import type { GuildMember } from './guildMember';
import type { User } from './user';

interface MessageAttachment extends Omit<APIAttachment, 'proxy_url'> {
  proxyUrl: string;
}

interface MessageActivity extends Omit<APIMessageActivity, 'party_id'> {
  partyId: string | null;
}

interface MessageApplication extends Omit<APIMessageApplication, 'cover_image'> {
  coverImage: string | null;
}

interface MessageReference {
  messageId: string | null;
  channelId: string | null;
  guildId: string | null;
}

interface Sticker extends Omit<APISticker, 'pack_id' | 'tags' | 'preview_asset' | 'format_type'> {
  packId: string;
  tags: string[];
  previewAsset: string | null;
  formatType: StickerFormatType;
}

interface Message extends SnowflakeEntity, Omit<
PatchedAPIMessage,
'channel_id' | 'guild_id' | 'author' |
'member' | 'content' | 'edited_timestamp' |
'mention_everyone' | 'mentions' | 'mention_roles' |
'mention_channels' | 'attachments' | 'reactions' |
'nonce' | 'webhook_id' | 'activity' |
'application' | 'message_reference' | 'flags' |
'stickers' | 'referenced_message'
> {
  channelId: string;
  guildId: string | null;
  author: User;
  member: GuildMember | null;
  content: string | null;
  editedTimestamp: number | null;
  editedAt: Date | null;
  mentionEveryone: boolean;
  mentionedUsers: Map<string, User & { member: GuildMember | null }>;
  mentionedRoles: string[];
  mentionedChannels: Map<string, { id: string; guildId: string; type: ChannelType; name: string }>;
  attachments: MessageAttachment[];
  // TODO: embeds

  reactions: Map<string, APIReaction>;
  pinned: boolean;
  webhookId: string;
  type: MessageType;
  activity: MessageActivity | null;
  application: MessageApplication | null;
  messageReference: MessageReference | null;
  flags: MessageFlags;
  stickers: Map<string, Sticker>;
  referencedMessage: Message | null;
  toString(): string;
}

export {
  MessageAttachment,
  MessageActivity,
  MessageApplication,
  Sticker,
  Message
};

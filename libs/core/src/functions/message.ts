import type { Message } from '../types';
import { PatchedAPIMessage, Patcher, Snowflake } from '@cordis/util';
import type { FactoryMeta } from '../FunctionManager';

const isAPIMessage = (message: any): message is PatchedAPIMessage => 'nick' in message &&
'roles' in message &&
'deaf' in message &&
'mute' in message;

const isMessage = (message: any): message is Message => 'user' in message &&
'roles' in message &&
message.roles instanceof Map &&
message.toString() === `<@${message.user.id}>`;

const sanitizeMessage = (raw: PatchedAPIMessage | Message, { functions: { retrieveFunction } }: FactoryMeta): Message => {
  if (retrieveFunction('isMessage')(raw)) return raw;

  const {
    /* eslint-disable @typescript-eslint/naming-convention */
    channel_id,
    guild_id = null,
    author: unpatchedAuthor,
    member,
    content = null,
    edited_timestamp,
    mention_everyone,
    mentions,
    mention_roles,
    mention_channels,
    attachments,
    reactions,
    webhook_id,
    activity,
    application,
    message_reference,
    stickers,
    referenced_message,
    ...message
  } = raw;

  const author = retrieveFunction('sanitizeUser')(Patcher.patchUser(unpatchedAuthor).data);

  const editedAt = edited_timestamp ? new Date(edited_timestamp) : null;

  return {
    ...message,
    ...Snowflake.getCreationData(message.id),
    channelId: channel_id,
    guildId: guild_id,
    author,
    member: member ? retrieveFunction('sanitizeGuildMember')({ ...Patcher.patchGuildMember(member).data, user: author }) : null,
    content,
    editedAt,
    editedTimestamp: editedAt?.getTime() ?? null,
    mentionEveryone: mention_everyone,
    mentionedUsers: new Map(
      mentions.map(rawMention => {
        const user = retrieveFunction('sanitizeUser')(Patcher.patchUser(rawMention).data);
        return [
          user.id,
          {
            ...user,
            member: rawMention.member
              ? retrieveFunction('sanitizeGuildMember')({ ...Patcher.patchGuildMember(rawMention.member).data, user })
              : null
          }
        ];
      })
    ),
    mentionedRoles: mention_roles,
    mentionedChannels: new Map(
      mention_channels?.map(({ guild_id, ...rawMention }) => [
        rawMention.id,
        {
          guildId: guild_id,
          ...rawMention
        }
      ]) ?? []
    ),
    attachments: attachments.map(({ proxy_url, ...rawAttachment }) => ({ proxyUrl: proxy_url, ...rawAttachment })),
    reactions: new Map(reactions.map(reaction => [(reaction.emoji.id ?? reaction.emoji.id)!, reaction])),
    webhookId: webhook_id,
    activity: activity
      ? {
        type: activity.type,
        partyId: activity.party_id ?? null
      }
      : null,
    application: application
      ? {
        id: application.id,
        coverImage: application.cover_image ?? null,
        description: application.description,
        icon: application.icon,
        name: application.name
      }
      : null,
    messageReference: message_reference
      ? {
        channelId: message_reference.channel_id ?? null,
        guildId: message_reference.guild_id ?? null,
        messageId: message_reference.message_id ?? null
      }
      : null,
    stickers: new Map(
      stickers?.map(sticker => [
        sticker.id,
        {
          ...sticker,
          packId: sticker.pack_id,
          tags: sticker.tags?.split(',') ?? [],
          previewAsset: sticker.preview_asset,
          formatType: sticker.format_type
        }
      ]) ?? []
    ),
    referencedMessage: referenced_message
      ? retrieveFunction('sanitizeMessage')(Patcher.patchMessage(referenced_message).data)
      : null,
    toString() {
      return this.content ?? '';
    }
  };
};

export {
  isAPIMessage,
  isMessage,
  sanitizeMessage
};

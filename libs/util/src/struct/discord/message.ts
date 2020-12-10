import { APIMessage } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedAPIMessage extends RequiredProp<
APIMessage,
'type' | 'pinned' | 'tts' | 'embeds' | 'attachments' | 'edited_timestamp' |
'reactions' | 'mentions' | 'webhook_id' | 'flags' | 'message_reference'> {}

export default <T extends PatchedAPIMessage | null | undefined>(n: Partial<APIMessage>, o?: T) => {
  const data = o ?? n;

  const {
    /* eslint-disable @typescript-eslint/naming-convention */
    type,
    content,
    author,
    pinned,
    tts,
    nonce,
    embeds,
    attachments,
    edited_timestamp,
    reactions,
    mentions,
    webhook_id,
    member,
    flags,
    message_reference
    /* eslint-enable @typescript-eslint/naming-convention */
  } = n;

  data.type = type ?? data.type ?? 0;
  data.content = (content !== '' ? content : undefined) ?? data.content;
  data.author = author ?? data.author;
  data.pinned = pinned ?? data.pinned ?? false;
  data.tts = tts ?? data.tts ?? false;
  data.nonce = nonce;
  data.embeds = embeds ?? data.embeds ?? [];
  data.attachments = attachments ?? data.attachments ?? [];
  data.edited_timestamp = edited_timestamp ?? data.edited_timestamp ?? null;
  data.reactions = reactions ?? data.reactions ?? [];
  data.mentions = mentions ?? data.mentions ?? [];
  data.webhook_id = webhook_id ?? data.webhook_id;
  data.member = member ?? data.member;
  data.flags = flags ?? data.flags ?? 0;
  data.message_reference = message_reference ?? data.message_reference;

  return {
    data: data as PatchedAPIMessage,
    old: o as T
  };
};

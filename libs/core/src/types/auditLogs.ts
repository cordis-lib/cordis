import type { SnowflakeEntity } from '@cordis/common';
import type { APIAuditLogChange, APIAuditLogEntry, AuditLogEvent } from 'discord-api-types';
import type { Integration } from './integration';
import type { User } from './user';
import type { Webhook } from './webhook';

enum AuditLogEntryTargetType {
  all,
  guild,
  channel,
  user,
  role,
  invite,
  webhook,
  emoji,
  message,
  integration,
  unknown
}

enum AuditLogOptionalInfoType {
  role,
  member
}

type ChannelOverwriteAuditLogEvents =
| AuditLogEvent.CHANNEL_OVERWRITE_CREATE
| AuditLogEvent.CHANNEL_OVERWRITE_UPDATE
| AuditLogEvent.CHANNEL_OVERWRITE_DELETE;

type OptionPropReflectingAuditLogEvents =
| ChannelOverwriteAuditLogEvents
| AuditLogEvent.MEMBER_PRUNE
| AuditLogEvent.MEMBER_MOVE
| AuditLogEvent.MEMBER_DISCONNECT
| AuditLogEvent.MESSAGE_PIN
| AuditLogEvent.MESSAGE_UNPIN
| AuditLogEvent.MESSAGE_DELETE
| AuditLogEvent.MESSAGE_BULK_DELETE;

interface AuditLogEntryOptionalInfo<T extends AuditLogEvent> {
  deleteMemberDays: T extends AuditLogEvent.MEMBER_PRUNE ? number : never;
  membersRemoved: T extends AuditLogEvent.MEMBER_PRUNE ? number : never;
  channelId: T extends AuditLogEvent.MEMBER_MOVE | AuditLogEvent.MESSAGE_PIN | AuditLogEvent.MESSAGE_UNPIN | AuditLogEvent.MESSAGE_DELETE
    ? string
    : never;
  messageId: T extends AuditLogEvent.MESSAGE_PIN | AuditLogEvent.MESSAGE_UNPIN ? string : never;
  count: T extends
  | AuditLogEvent.MESSAGE_DELETE | AuditLogEvent.MESSAGE_BULK_DELETE | AuditLogEvent.MEMBER_DISCONNECT | AuditLogEvent.MEMBER_MOVE
    ? number
    : never;
  id: T extends ChannelOverwriteAuditLogEvents ? string : never;
  type: T extends ChannelOverwriteAuditLogEvents ? AuditLogOptionalInfoType : never;
  roleName: T extends ChannelOverwriteAuditLogEvents ? string : never;
}

interface APIAuditLogChangeData<K extends string, D extends unknown> {
  key: K;
  /* eslint-disable @typescript-eslint/naming-convention */
  new_value?: D;
  old_value?: D;
  /* eslint-enable @typescript-eslint/naming-convention */
}

type MakeAuditLogEntryChange<T> = T extends APIAuditLogChangeData<infer K, infer D> ? {
  key: K;
  new: D | null;
  old: D | null;
} : never;

type AuditLogEntryChange = MakeAuditLogEntryChange<APIAuditLogChange>;

interface AuditLogEntry<T extends AuditLogEvent> extends SnowflakeEntity, Omit<
APIAuditLogEntry,
'target_id' | 'changes' | 'user_id' | 'action_type' | 'options' | 'reason'
> {
  targetId: string | null;
  targetType: AuditLogEntryTargetType;
  changes: AuditLogEntryChange[];
  userId: string;
  actionType: T;
  options: T extends OptionPropReflectingAuditLogEvents ? AuditLogEntryOptionalInfo<T> : null;
  reason: string | null;
}

interface AuditLog {
  webhooks: Map<string, Webhook>;
  users: Map<string, User>;
  integrations: Map<string, Integration>;
  auditLogEntires: Map<string, AuditLogEntry<AuditLogEvent>>;
}

export {
  AuditLogEntryTargetType,
  AuditLogOptionalInfoType,
  OptionPropReflectingAuditLogEvents,
  AuditLogEntryOptionalInfo,
  APIAuditLogChangeData,
  AuditLogEntryChange,
  AuditLogEntry,
  AuditLog
};

import {
  AuditLogOptionalInfoType,
  AuditLogEntry,
  AuditLogEntryChange,
  AuditLogEntryOptionalInfo,
  OptionPropReflectingAuditLogEvents,
  AuditLog
} from '../types';
import { Patcher, Snowflake } from '@cordis/util';
import { APIAuditLog, APIAuditLogEntry, AuditLogEvent, AuditLogOptionsType } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';

interface PartialAuditLogEntry<T extends AuditLogEvent> {
  actionType: T;
  options: T extends OptionPropReflectingAuditLogEvents ? AuditLogEntryOptionalInfo<T> : null;
}

const sanitizeAuditLogEntry = <T extends AuditLogEvent>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  data: Omit<APIAuditLogEntry, 'action_type'> & { action_type: T },
  { functions: { retrieveFunction } }: FactoryMeta
): AuditLogEntry<T> => {
  const targetType = retrieveFunction('resolveAuditLogEntryTargetType')(data.action_type);

  const changes: AuditLogEntryChange[] = data.changes?.map(
    change => ({ 'key': change.key, 'new': change.new_value ?? null, 'old': change.old_value ?? null } as any)
  ) ?? [];

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let entry = { actionType: data.action_type } as PartialAuditLogEntry<T>;

  if (data.options) {
    // Declare this extra reference for type-guard's sake
    const reference = entry as PartialAuditLogEntry<OptionPropReflectingAuditLogEvents>;
    // @ts-ignore
    reference.options = {};

    switch (reference.actionType) {
      case AuditLogEvent.MEMBER_PRUNE: {
        reference.options.deleteMemberDays = parseInt(data.options.delete_member_days!);
        reference.options.membersRemoved = parseInt(data.options.members_removed!);
        break;
      }

      case AuditLogEvent.MEMBER_MOVE:
      case AuditLogEvent.MESSAGE_DELETE:
      case AuditLogEvent.MESSAGE_BULK_DELETE: {
        reference.options.channelId = data.options.channel_id!;
        reference.options.count = parseInt(data.options.count!);
        break;
      }

      case AuditLogEvent.MESSAGE_PIN:
      case AuditLogEvent.MESSAGE_UNPIN: {
        reference.options.channelId = data.options.channel_id!;
        reference.options.messageId = data.options.message_id!;
        break;
      }

      case AuditLogEvent.MEMBER_DISCONNECT: {
        reference.options.count = parseInt(data.options.count!);
        break;
      }

      case AuditLogEvent.CHANNEL_OVERWRITE_CREATE:
      case AuditLogEvent.CHANNEL_OVERWRITE_UPDATE:
      case AuditLogEvent.CHANNEL_OVERWRITE_DELETE: {
        reference.options.id = data.options.id!;
        reference.options.type = data.options.type === AuditLogOptionsType.Member
          ? AuditLogOptionalInfoType.member
          : AuditLogOptionalInfoType.role;
        reference.options.roleName = data.options.role_name!;
      }
    }

    // @ts-ignore
    entry = reference;
  }

  return {
    ...entry,
    ...Snowflake.getCreationData(data.id),
    targetId: data.target_id,
    targetType,
    changes,
    userId: data.user_id,
    id: data.id,
    reason: data.reason ?? null
  };
};

const sanitizeAuditLog = (data: APIAuditLog, { functions: { retrieveFunction } }: FactoryMeta): AuditLog => ({
  users: new Map(
    data.users.map(
      user => [
        user.id,
        retrieveFunction('sanitizeUser')(
          Patcher.patchUser(user).data
        )
      ]
    )
  ),
  webhooks: new Map(
    data.webhooks.map(
      webhook => [
        webhook.id,
        retrieveFunction('sanitizeWebhook')(webhook)
      ]
    )
  ),
  integrations: new Map(
    data.integrations.map(
      integration => [
        integration.id,
        retrieveFunction('sanitizeIntegration')(integration)
      ]
    )
  ),
  auditLogEntires: new Map(
    data.audit_log_entries.map(
      entry => [
        entry.id,
        retrieveFunction('sanitizeAuditLogEntry')(entry)
      ]
    )
  )
});

export {
  sanitizeAuditLogEntry,
  sanitizeAuditLog
};

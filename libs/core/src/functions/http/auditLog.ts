import { RESTGetAPIAuditLogQuery, RESTGetAPIAuditLogResult, Routes } from 'discord-api-types';
import { CordisCoreError } from '../../util/Error';
import { container } from 'tsyringe';
import type { FactoryMeta } from '../../FunctionManager';
import type { GetGuildAuditLogQuery, GuildResolvable } from '../../types';

const getAuditLog = (
  guild: GuildResolvable | string,
  query: GetGuildAuditLogQuery | RESTGetAPIAuditLogQuery
) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  const isRaw = (data: GetGuildAuditLogQuery | RESTGetAPIAuditLogQuery): data is RESTGetAPIAuditLogQuery =>
    'user_id' in data ||
    'action_type' in data;

  return rest
    .get<RESTGetAPIAuditLogResult, never, RESTGetAPIAuditLogQuery>(
    Routes.guildAuditLog(guild),
    {
      query: isRaw(query)
        ? query
        : {
        /* eslint-disable @typescript-eslint/naming-convention */
          action_type: query.actionType,
          before: query.before,
          limit: query.limit,
          user_id: query.userId
        /* eslint-enable @typescript-eslint/naming-convention */
        }
    }
  )
    .then(data => retrieveFunction('sanitizeAuditLog')(data));
};

export {
  getAuditLog
};

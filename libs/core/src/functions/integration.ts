import { Patcher, Snowflake } from '@cordis/util';
import type { APIGuildIntegration } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';
import type { Integration } from '../Types';

const isAPIWIntegration = (integration: any): integration is APIGuildIntegration => 'id' in integration &&
'name' in integration &&
'type' in integration &&
'enabled' in integration;

const isIntegration = (integration: any): integration is Integration => '' in integration;

const sanitizeIntegration = (raw: APIGuildIntegration | Integration, { functions: { retrieveFunction } }: FactoryMeta): Integration => {
  if (retrieveFunction('isIntegration')(raw)) return raw;

  const {
    syncing,
    user,
    revoked,
    /* eslint-disable @typescript-eslint/naming-convention */
    role_id,
    enable_emoticons,
    expire_behavior,
    expire_grace_period,
    synced_at,
    subscriber_count,
    application,
    /* eslint-enable @typescript-eslint/naming-convention */
    ...integration
  } = raw;

  return {
    ...integration,
    ...Snowflake.getCreationData(integration.id),
    syncing: syncing ?? false,
    roleId: role_id ?? null,
    enableEmoticons: enable_emoticons ?? false,
    expireBehavior: expire_behavior ?? null,
    expireGracePeriod: expire_grace_period ?? null,
    user: user ? (retrieveFunction('sanitizeUser')(Patcher.patchUser(user).data)) : null,
    syncedTimestamp: synced_at ?? null,
    syncedAt: synced_at ? new Date(synced_at) : null,
    subscriberCount: subscriber_count ?? null,
    revoked: revoked ?? false,
    application: application
      ? {
        ...application,
        bot: application.bot ? (retrieveFunction('sanitizeUser')(Patcher.patchUser(application.bot).data)) : null
      }
      : null
  };
};

export {
  isAPIWIntegration,
  isIntegration,
  sanitizeIntegration
};


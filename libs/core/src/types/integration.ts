import type { SnowflakeEntity } from '@cordis/common';
import type { APIGuildIntegration, APIGuildIntegrationApplication, IntegrationExpireBehavior } from 'discord-api-types';
import type { User } from './user';

interface GuildIntegrationApplication extends Omit<APIGuildIntegrationApplication, 'bot'> {
  bot: User | null;
}

interface Integration extends SnowflakeEntity, Omit<
APIGuildIntegration,
'syncing' | 'role_id' | 'enable_emoticons' |
'expire_behavior' | 'expire_grace_period' | 'user' |
'synced_at' | 'subscriber_count' | 'revoked' | 'application'
> {
  syncing: boolean;
  roleId: string | null;
  enableEmoticons: boolean;
  expireBehavior: IntegrationExpireBehavior | null;
  expireGracePeriod: number | null;
  user: User | null;
  syncedTimestamp: number | null;
  syncedAt: Date | null;
  subscriberCount: number | null;
  revoked: boolean;
  application: GuildIntegrationApplication | null;
}

export {
  GuildIntegrationApplication,
  Integration
};

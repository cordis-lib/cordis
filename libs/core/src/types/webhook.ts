import { SnowflakeEntity } from '@cordis/util';
import { APIPartialChannel, APIWebhook, WebhookType } from 'discord-api-types';
import type { Guild } from './guild';
import type { User } from './user';

interface BaseWebhook extends SnowflakeEntity, Omit<
APIWebhook,
'guild_id' | 'channel_id' | 'user' | 'application_id' | 'source_guild' | 'source_channel'
> {
  guildId: string | null;
  channelId: string;
  user: User | null;
  sourceGuild: Guild | null;
  // TODO channels
  sourceChannel: APIPartialChannel | null;
  applicationId: string | null;
}

interface IncomingWebhook extends BaseWebhook {
  type: WebhookType.Incoming;
  token: string;
}

interface ChannelFollowerWebhook extends Omit<BaseWebhook, 'token'> {
  type: WebhookType.ChannelFollower;
  token: never | null;
}

type Webhook = IncomingWebhook | ChannelFollowerWebhook;

export {
  BaseWebhook,
  IncomingWebhook,
  ChannelFollowerWebhook,
  Webhook
};

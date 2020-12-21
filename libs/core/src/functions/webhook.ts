import { Patcher, Snowflake } from '@cordis/util';
import { APIWebhook, WebhookType } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';
import type { NewsChannel, Webhook } from '../types';

const isAPIWebhook = (webhook: any): webhook is APIWebhook => 'token' in webhook &&
'channel_id' in webhook &&
'application_id' in webhook &&
'name' in webhook &&
'avatar' in webhook &&
'type' in webhook &&
(webhook.type === WebhookType.ChannelFollower || webhook.type === WebhookType.Incoming);

const isWebhook = (webhook: any): webhook is Webhook => 'guildId' in webhook &&
'channelId' in webhook &&
'user' in webhook &&
'applicationId' in webhook &&
'type' in webhook &&
(webhook.type === WebhookType.ChannelFollower || webhook.type === WebhookType.Incoming);

const sanitizeWebhook = (raw: APIWebhook | Webhook, { functions: { retrieveFunction } }: FactoryMeta): Webhook => {
  if (retrieveFunction('isWebhook')(raw)) return raw;

  const {
    user,
    type,
    token,
    /* eslint-disable @typescript-eslint/naming-convention */
    guild_id,
    channel_id,
    application_id,
    source_guild,
    source_channel
    /* eslint-enable @typescript-eslint/naming-convention */,
    ...webhook
  } = raw;

  return {
    ...webhook,
    ...Snowflake.getCreationData(webhook.id),
    type: type as any,
    token: token ?? null,
    guildId: guild_id ?? null,
    channelId: channel_id,
    user: user ? (retrieveFunction('sanitizeUser')(Patcher.patchUser(user).data)) : null,
    sourceGuild: source_guild ? retrieveFunction('sanitizeGuild')(Patcher.patchGuild(source_guild).data) : null,
    sourceChannel: source_channel
      ? retrieveFunction('sanitizeChannel')(Patcher.patchChannel(source_channel).data) as NewsChannel
      : null,
    applicationId: application_id
  };
};

export {
  isAPIWebhook,
  isWebhook,
  sanitizeWebhook
};

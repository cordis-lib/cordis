import * as dAPI from 'discord-api-types/v8';
import { RestManager } from '@cordis/rest';

interface webhookIdOrToken { webhookID: dAPI.Snowflake; webhookToken?: string }

export const makeRestUtils = (rest: RestManager) => (
  {
    fetchAuditLogs: (guildID: dAPI.Snowflake, options?: dAPI.RESTGetAPIAuditLogQuery) => rest.get<dAPI.APIAuditLog, dAPI.RESTGetAPIAuditLogQuery>(dAPI.Routes.guildAuditLog(guildID), { query: options }),
    createWebhook: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelWebhookJSONBody) => rest.post<dAPI.APIWebhook, dAPI.RESTPostAPIChannelWebhookJSONBody>(dAPI.Routes.channelWebhooks(channelID), { data }),
    fetchWebhooks: (...args: Parameters<typeof dAPI.Routes.channelWebhooks>) => rest.get<dAPI.RESTGetAPIChannelWebhooksResult>(dAPI.Routes.channelWebhooks(...args)),
    fetchWebhook: (...args: Parameters<typeof dAPI.Routes.webhook>) => rest.get<dAPI.RESTGetAPIWebhookResult>(dAPI.Routes.webhook(...args)),
    editWebhook: ({ webhookID, webhookToken }: webhookIdOrToken, data: dAPI.RESTPatchAPIWebhookJSONBody | dAPI.RESTPatchAPIWebhookWithTokenJSONBody) => rest.patch<dAPI.RESTPatchAPIWebhookResult, dAPI.RESTPatchAPIWebhookJSONBody>(dAPI.Routes.webhook(webhookID, webhookToken), { data }),
    deleteWebhook: ({ webhookID, webhookToken }: webhookIdOrToken) => rest.delete<dAPI.RESTDeleteAPIWebhookResult>(dAPI.Routes.webhook(webhookID, webhookToken)),
    sendWebhookMessage: (webhookID: dAPI.Snowflake, webhookToken: string, data: dAPI.RESTPostAPIWebhookWithTokenJSONBody) => rest.post<dAPI.RESTPostAPIWebhookWithTokenResult, dAPI.RESTPostAPIWebhookWithTokenJSONBody>(dAPI.Routes.webhook(webhookID, webhookToken), { data }),
    editWebhookMessage: (webhookID: dAPI.Snowflake, webhookToken: string, messageID: dAPI.Snowflake, data: dAPI.RESTPatchAPIWebhookWithTokenMessageJSONBody) => rest.patch<dAPI.APIMessage, dAPI.RESTPatchAPIWebhookWithTokenMessageJSONBody>(dAPI.Routes.webhookMessage(webhookID, webhookToken, messageID), { data })
  }
);

import * as dAPI from 'discord-api-types/v8';
import { RestManager } from '@cordis/rest';

/*
TO:DO

Channel
 editChannel - encapsulate permissions
 fetchChannelMessages/fetchChannelMessage
 sendMessage
 crosspostMessage
 addMessageReaction
 deleteOwnMessageReaction
 deleteUserReaction
 deleteAllReactions
 deleteReaction
 fetchMessageReactions
 editMessage
 deleteMessage
 bulkDeleteMessages
 fetchChannelInvites
 createChannelInvite
 followNewsChannel
 startTyping
 fetchPinnedChannelMessages
 deletePinnedChannelMessage
 addPinnedChannelMessage
 groupDMAddRecipient
 groupDMRemoveRecipient

Guild
 createGuild
 fetchGuild
 fetchGuildPreview
 editGuild
 deleteGuild
 fetchGuildChannels
 createGuildChannel
 fetchGuildMember
 addGuildMember
 editGuildMember
 setNickname
 addRole
 removeRole
 kickMember
 fetchGuildBans
 fetchGuildBan
 banMember
 unbanMember
 fetchRoles
 createRole
 setRolePosition
 editRole
 deleteRole
 pruneGuild
 getPredictedPruneResult
 fetchGuildVoiceRegions
 fetchGuildInvites
 createGuildIntegration
 editGuildIntegration
 deleteGuildIntegration
 syncGuildIntegration
 fetchGuildWidget
 editGuildWidget (settings too)
 fetchGuildVanityURL
 fetchGuildWidgetImage

fetchChannel: (...args: Parameters<typeof dAPI.Routes.channel>) => rest.get<dAPI.APIChannel>(dAPI.Routes.channel(...args)),
deleteChannel: (...args: Parameters<typeof dAPI.Routes.channel>) => rest.delete<dAPI.APIChannel>(dAPI.Routes.channel(...args)),
*/


interface webhookIdOrToken { webhookID: dAPI.Snowflake; webhookToken?: string }

export const makeRestUtils = (rest: RestManager) => (
  {
    fetchAuditLogs: (guildID: dAPI.Snowflake, options?: dAPI.RESTGetAPIAuditLogQuery) => rest.get<dAPI.APIAuditLog, dAPI.RESTGetAPIAuditLogQuery>(dAPI.Routes.guildAuditLog(guildID), { query: options }),
    fetchInvite: (...args: Parameters<typeof dAPI.Routes.invite>) => rest.get<dAPI.RESTGetAPIInviteResult>(dAPI.Routes.invite(...args)),
    deleteInvite: (...args: Parameters<typeof dAPI.Routes.invite>) => rest.delete<dAPI.RESTDeleteAPIInviteResult>(dAPI.Routes.invite(...args)),
    createWebhook: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelWebhookJSONBody) => rest.post<dAPI.APIWebhook, dAPI.RESTPostAPIChannelWebhookJSONBody>(dAPI.Routes.channelWebhooks(channelID), { data }),
    fetchWebhooks: (...args: Parameters<typeof dAPI.Routes.channelWebhooks>) => rest.get<dAPI.RESTGetAPIChannelWebhooksResult>(dAPI.Routes.channelWebhooks(...args)),
    fetchWebhook: (...args: Parameters<typeof dAPI.Routes.webhook>) => rest.get<dAPI.RESTGetAPIWebhookResult>(dAPI.Routes.webhook(...args)),
    editWebhook: ({ webhookID, webhookToken }: webhookIdOrToken, data: dAPI.RESTPatchAPIWebhookJSONBody | dAPI.RESTPatchAPIWebhookWithTokenJSONBody) => rest.patch<dAPI.RESTPatchAPIWebhookResult, dAPI.RESTPatchAPIWebhookJSONBody>(dAPI.Routes.webhook(webhookID, webhookToken), { data }),
    deleteWebhook: ({ webhookID, webhookToken }: webhookIdOrToken) => rest.delete<dAPI.RESTDeleteAPIWebhookResult>(dAPI.Routes.webhook(webhookID, webhookToken)),
    sendWebhookMessage: (webhookID: dAPI.Snowflake, webhookToken: string, data: dAPI.RESTPostAPIWebhookWithTokenJSONBody) => rest.post<dAPI.RESTPostAPIWebhookWithTokenResult, dAPI.RESTPostAPIWebhookWithTokenJSONBody>(dAPI.Routes.webhook(webhookID, webhookToken), { data }),
    editWebhookMessage: (webhookID: dAPI.Snowflake, webhookToken: string, messageID: dAPI.Snowflake, data: dAPI.RESTPatchAPIWebhookWithTokenMessageJSONBody) => rest.patch<dAPI.APIMessage, dAPI.RESTPatchAPIWebhookWithTokenMessageJSONBody>(dAPI.Routes.webhookMessage(webhookID, webhookToken, messageID), { data }),
    fetchGuildEmojis: (...args: Parameters<typeof dAPI.Routes.guildEmojis>) => rest.get<dAPI.RESTGetAPIGuildEmojisResult>(dAPI.Routes.guildEmojis(...args)),
    fetchGuildEmoji: (...args: Parameters<typeof dAPI.Routes.guildEmoji>) => rest.get<dAPI.RESTGetAPIGuildEmojiResult>(dAPI.Routes.guildEmoji(...args)),
    createGuildEmoji: (guildID: dAPI.Snowflake, data: dAPI.RESTPostAPIGuildEmojiJSONBody) => rest.post<dAPI.RESTPostAPIGuildEmojiResult, dAPI.RESTPostAPIGuildEmojiJSONBody>(dAPI.Routes.guildEmojis(guildID), { data }),
    editGuildEmoji: (guildID: dAPI.Snowflake, emojiID: dAPI.Snowflake, data: dAPI.RESTPatchAPIGuildEmojiJSONBody) => rest.patch<dAPI.RESTPatchAPIGuildEmojiResult, dAPI.RESTPatchAPIGuildEmojiJSONBody>(dAPI.Routes.guildEmoji(guildID, emojiID), { data }),
    deleteGuildEmoji: (...args: Parameters<typeof dAPI.Routes.guildEmoji>) => rest.delete<dAPI.RESTDeleteAPIGuildEmojiResult>(dAPI.Routes.guildEmoji(...args)),
    fetchMe: () => rest.get<dAPI.RESTGetAPICurrentUserResult>(dAPI.Routes.user()),
    fetchUser: (userID?: dAPI.Snowflake | null) => rest.get<dAPI.RESTGetAPIUserResult>(dAPI.Routes.user(userID ?? undefined)),
    editMe: (data: dAPI.RESTPatchAPICurrentUserJSONBody) => rest.patch<dAPI.RESTPatchAPICurrentUserResult, dAPI.RESTPatchAPICurrentUserJSONBody>(dAPI.Routes.user(), { data }),
    leaveGuild: (...args: Parameters<typeof dAPI.Routes.guild>) => rest.delete<dAPI.RESTDeleteAPICurrentUserGuildResult>(dAPI.Routes.guild(...args)),
    createDM: (data: dAPI.RESTPostAPICurrentUserCreateDMChannelJSONBody) => rest.post<dAPI.RESTPostAPICurrentUserCreateDMChannelResult, dAPI.RESTPostAPICurrentUserCreateDMChannelJSONBody>(dAPI.Routes.userChannels(), { data }),
    getUserConnections: () => rest.get<dAPI.RESTGetAPICurrentUserConnectionsResult>(dAPI.Routes.userConnections()),
    fetchTemplate: (...args: Parameters<typeof dAPI.Routes.template>) => rest.get<dAPI.RESTGetAPITemplateResult>(dAPI.Routes.template(...args)),
    createGuildFromTemplate: (guildID: dAPI.Snowflake, data: dAPI.RESTPostAPITemplateCreateGuildJSONBody) => rest.post<dAPI.RESTPostAPITemplateCreateGuildResult, dAPI.RESTPostAPITemplateCreateGuildJSONBody>(dAPI.Routes.template(guildID), { data }),
    fetchGuildTemplates: (...args: Parameters<typeof dAPI.Routes.guildTemplates>) => rest.get<dAPI.RESTGetAPIGuildTemplatesResult>(dAPI.Routes.guildTemplates(...args)),
    createGuildTemplate: (guildID: dAPI.Snowflake, data: dAPI.RESTPostAPIGuildTemplatesJSONBody) => rest.post<dAPI.RESTPostAPIGuildTemplatesResult, dAPI.RESTPostAPIGuildTemplatesJSONBody>(dAPI.Routes.guildTemplates(guildID), { data }),
    syncGuildTemplate: (guildID: dAPI.Snowflake, templateCode: string) => rest.put<dAPI.RESTPutAPIGuildTemplateSyncResult>(dAPI.Routes.guildTemplate(guildID, templateCode)),
    editGuildTemplate: (guildID: dAPI.Snowflake, templateCode: string, data: dAPI.RESTPatchAPIGuildTemplateJSONBody) => rest.patch<dAPI.RESTPatchAPIGuildTemplateResult, dAPI.RESTPatchAPIGuildTemplateJSONBody>(dAPI.Routes.guildTemplate(guildID, templateCode), { data }),
    deleteGuildTemplate: (...args: Parameters<typeof dAPI.Routes.guildTemplate>) => rest.delete<dAPI.RESTDeleteAPIGuildTemplateResult>(dAPI.Routes.guildTemplate(...args))
  }
);

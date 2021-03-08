/* istanbul ignore file */

import * as dAPI from 'discord-api-types/v8';
import { RestManager } from '@cordis/rest';

/*
TO:DO

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


*/

interface webhookIdOrToken { webhookID: dAPI.Snowflake; webhookToken?: string }

export const makeRestUtils = (rest: RestManager) => (
  {
    fetchChannel: (...args: Parameters<typeof dAPI.Routes.channel>) => rest.get<dAPI.APIChannel>(dAPI.Routes.channel(...args)),
    editChannel: (channelID: dAPI.Snowflake, data: dAPI.RESTPatchAPIChannelJSONBody) => rest.patch<dAPI.RESTPatchAPIChannelResult, dAPI.RESTPatchAPIChannelJSONBody>(dAPI.Routes.channel(channelID), { data }),
    deleteChannel: (...args: Parameters<typeof dAPI.Routes.channel>) => rest.delete<dAPI.APIChannel>(dAPI.Routes.channel(...args)),
    fetchChannelMessages: (...args: Parameters<typeof dAPI.Routes.channelMessages>) => rest.get<dAPI.RESTGetAPIChannelMessagesResult>(dAPI.Routes.channelMessages(...args)),
    fetchChannelMessage: (...args: Parameters<typeof dAPI.Routes.channelMessage>) => rest.get<dAPI.RESTGetAPIChannelMessageResult>(dAPI.Routes.channelMessage(...args)),
    sendMessage: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelMessageJSONBody) => rest.post<dAPI.RESTPostAPIChannelMessageResult, dAPI.RESTPostAPIChannelMessageJSONBody>(dAPI.Routes.channelMessages(channelID), { data }),
    crosspostMessage: (channelID: dAPI.Snowflake, messageID: dAPI.Snowflake) => rest.post<dAPI.RESTPostAPIChannelMessageCrosspostResult, null>(dAPI.Routes.channelMessageCrosspost(channelID, messageID), { data: null }),
    addReaction: (...args: Parameters<typeof dAPI.Routes.channelMessageReaction>) => rest.put<dAPI.RESTPutAPIChannelMessageReactionResult>(dAPI.Routes.channelMessageReaction(...args)),
    deleteUserReaction: (channelID: dAPI.Snowflake, messageID: dAPI.Snowflake, emoji: dAPI.Snowflake | string, userID?: dAPI.Snowflake) => userID ? rest.delete<dAPI.RESTDeleteAPIChannelMessageUserReactionResult>(dAPI.Routes.channelMessageUserReaction(channelID, messageID, emoji, userID)) : rest.delete<dAPI.RESTDeleteAPIChannelMessageOwnReaction>(dAPI.Routes.channelMessageOwnReaction(channelID, messageID, emoji)),
    deleteAllMessageReactions: (...args: Parameters<typeof dAPI.Routes.channelMessageAllReactions>) => rest.delete<dAPI.RESTDeleteAPIChannelAllMessageReactionsResult>(dAPI.Routes.channelMessageAllReactions(...args)),
    deleteAllEmoteReaction: (...args: Parameters<typeof dAPI.Routes.channelMessageReaction>) => rest.delete<dAPI.RESTDeleteAPIChannelMessageReactionResult>(dAPI.Routes.channelMessageReaction(...args)),
    fetchMessageReactions: (channelID: dAPI.Snowflake, messageID: dAPI.Snowflake, emoji: dAPI.Snowflake | string, options: dAPI.RESTGetAPIChannelMessagesQuery) => rest.get<dAPI.RESTGetAPIChannelMessageResult, dAPI.RESTGetAPIChannelMessagesQuery>(dAPI.Routes.channelMessageReaction(channelID, messageID, emoji), { query: options }),
    editMessage: (channelID: dAPI.Snowflake, messageID: dAPI.Snowflake, data: dAPI.RESTPatchAPIChannelMessageJSONBody) => rest.patch<dAPI.RESTPatchAPIChannelMessageResult, dAPI.RESTPatchAPIChannelMessageJSONBody>(dAPI.Routes.channelMessage(channelID, messageID), { data }),
    deleteMessage: (...args: Parameters<typeof dAPI.Routes.channelMessage>) => rest.delete(dAPI.Routes.channelMessage(...args)),
    bulkDeleteMessages: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelMessagesBulkDeleteJSONBody) => rest.post<dAPI.RESTPostAPIChannelMessagesBulkDeleteResult, dAPI.RESTPostAPIChannelMessagesBulkDeleteJSONBody>(dAPI.Routes.channelBulkDelete(channelID), { data }),
    editChannelPermissions: (channelID: dAPI.Snowflake, owerwriteID: dAPI.Snowflake, data: dAPI.RESTPutAPIChannelPermissionJSONBody) => rest.put<dAPI.RESTPutAPIChannelPermissionResult, dAPI.RESTPutAPIChannelPermissionJSONBody>(dAPI.Routes.channelPermission(channelID, owerwriteID), { data }),
    deleteChannelPermissions: (...args: Parameters<typeof dAPI.Routes.channelPermission>) => rest.delete<dAPI.RESTDeleteAPIChannelPermissionResult>(dAPI.Routes.channelPermission(...args)),
    fetchChannelInvites: (...args: Parameters<typeof dAPI.Routes.channelInvites>) => rest.get<dAPI.RESTGetAPIChannelInvitesResult>(dAPI.Routes.channelInvites(...args)),
    createChannelInvite: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelInviteJSONBody) => rest.post<dAPI.RESTPostAPIChannelInviteResult, dAPI.RESTPostAPIChannelInviteJSONBody>(dAPI.Routes.channelInvites(channelID), { data }),
    followNewsChannel: (channelID: dAPI.Snowflake, data: dAPI.RESTPostAPIChannelFollowersJSONBody) => rest.post<dAPI.RESTPostAPIChannelFollowersResult, dAPI.RESTPostAPIChannelFollowersJSONBody>(dAPI.Routes.channelFollowers(channelID), { data }),
    startTyping: (...args: Parameters<typeof dAPI.Routes.channelTyping>) => rest.get<dAPI.RESTPostAPIChannelTypingResult>(dAPI.Routes.channelTyping(...args)),
    fetchPinnedChannelMessages: (...args: Parameters<typeof dAPI.Routes.channelPins>) => rest.get<dAPI.RESTGetAPIChannelPinsResult>(dAPI.Routes.channelPins(...args)),
    deletePinnedChannelMessage: (...args: Parameters<typeof dAPI.Routes.channelPin>) => rest.delete<dAPI.RESTDeleteAPIChannelPinResult>(dAPI.Routes.channelPin(...args)),
    addPinnedChannelMessage: (...args: Parameters<typeof dAPI.Routes.channelPin>) => rest.put<dAPI.RESTDeleteAPIChannelPinResult>(dAPI.Routes.channelPin(...args)),
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

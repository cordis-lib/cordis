import {
  RESTDeleteAPIChannelResult,
  RESTGetAPIChannelMessageResult,
  RESTGetAPIChannelMessagesQuery,
  RESTGetAPIChannelMessagesResult,
  RESTGetAPIChannelResult,
  RESTPatchAPIChannelJSONBody,
  RESTPatchAPIChannelResult,
  Routes
} from 'discord-api-types';
import { CordisCoreError } from '../../util/Error';
import { Patcher } from '@cordis/common';
import { Permissions } from '../../util/Permissions';
import type { ChannelResolvable, MessageResolvable, PatchChannelData } from '../../types';
import type { FactoryMeta } from '../../FunctionManager';

const getChannel = (channel: ChannelResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof channel !== 'string') {
    const resolved = retrieveFunction('resolveChannelId')(channel);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'channel id');
    channel = resolved;
  }

  return rest
    .get<RESTGetAPIChannelResult>(Routes.channel(channel))
    .then(data => retrieveFunction('sanitizeChannel')(Patcher.patchChannel(data).data));
};

const modifyChannel = (
  channel: ChannelResolvable | string,
  data: PatchChannelData | RESTPatchAPIChannelJSONBody,
  { functions: { retrieveFunction }, rest }: FactoryMeta
) => {
  if (typeof channel !== 'string') {
    const resolved = retrieveFunction('resolveChannelId')(channel);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'channel id');
    channel = resolved;
  }

  const isRaw = (data: PatchChannelData | RESTPatchAPIChannelJSONBody): data is RESTPatchAPIChannelJSONBody =>
    'rate_limit_per_user' in data ||
    'user_limit' in data ||
    'permission_overwrites' in data ||
    'parent_id' in data;

  return rest
    .patch<RESTPatchAPIChannelResult, RESTPatchAPIChannelJSONBody>(
    Routes.channel(channel),
    {
      data: isRaw(data)
        ? data
        : {
          name: data.name,
          type: data.type,
          position: data.position,
          topic: data.topic,
          nsfw: data.nsfw,
          /* eslint-disable @typescript-eslint/naming-convention */
          rate_limit_per_user: data.rateLimitPerUser,
          // @ts-ignore
          // TODO wait for discord-api-types fix https://github.com/discordjs/discord-api-types/pull/60
          bitrate: data.bitrate,
          user_limit: data.userLimit,
          permission_overwrites: data.permissionOverwrites?.map(o => ({
            ...o,
            allow: String((o.allow instanceof Permissions ? o.allow : new Permissions(o.allow).valueOf())),
            deny: String((o.deny instanceof Permissions ? o.deny : new Permissions(o.deny).valueOf()))
          })),
          parent_id: data.parentId
          /* eslint-enable @typescript-eslint/naming-convention */
        }
    }
  );
};

const deleteChannel = (channel: ChannelResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof channel !== 'string') {
    const resolved = retrieveFunction('resolveChannelId')(channel);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'channel id');
    channel = resolved;
  }

  return rest
    .delete<RESTDeleteAPIChannelResult>(Routes.channel(channel))
    .then(data => retrieveFunction('sanitizeChannel')(Patcher.patchChannel(data).data));
};

const getChannelMessages = (
  channel: ChannelResolvable | string,
  data: RESTGetAPIChannelMessagesQuery,
  { functions: { retrieveFunction }, rest }: FactoryMeta
) => {
  if (typeof channel !== 'string') {
    const resolved = retrieveFunction('resolveChannelId')(channel);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'channel id');
    channel = resolved;
  }

  return rest
    .get<RESTGetAPIChannelMessagesResult, never, RESTGetAPIChannelMessagesQuery>(Routes.channelMessages(channel), { query: data })
    .then(messages => new Map(
      messages.map(
        message => [message.id, retrieveFunction('sanitizeMessage')(Patcher.patchMessage(message).data)]
      )
    ));
};

const getChannelMessage = (
  channel: ChannelResolvable | string,
  message: MessageResolvable | string,
  { functions: { retrieveFunction }, rest }: FactoryMeta
) => {
  if (typeof channel !== 'string') {
    const resolved = retrieveFunction('resolveChannelId')(channel);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'channel id');
    channel = resolved;
  }

  if (typeof message !== 'string') {
    const resolved = retrieveFunction('resolveMessageId')(message);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'message id');
    message = resolved;
  }

  return rest
    .get<RESTGetAPIChannelMessageResult>(Routes.channelMessage(channel, message))
    .then(message => retrieveFunction('sanitizeMessage')(Patcher.patchMessage(message).data));
};

// const createMessage =

export {
  getChannel,
  modifyChannel,
  deleteChannel,
  getChannelMessages,
  getChannelMessage
};

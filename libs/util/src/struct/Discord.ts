import { APIChannel, ChannelType } from 'discord-api-types';

export * from './discord/clientUser';
export * from './discord/dmChannel';
export * from './discord/guild';
export * from './discord/guildChannel';
export * from './discord/guildMember';
export * from './discord/message';
export * from './discord/presence';
export * from './discord/role';
export * from './discord/storeChannel';
export * from './discord/textChannel';
export * from './discord/user';
export * from './discord/voiceChannel';

import { default as patchClientUser } from './discord/clientUser';
import { default as patchDmChannel } from './discord/dmChannel';
import { default as patchGuild } from './discord/guild';
import { default as patchGuildChannel } from './discord/guildChannel';
import { default as patchGuildMember } from './discord/guildMember';
import { default as patchMessage } from './discord/message';
import { default as patchPresence } from './discord/presence';
import { default as patchRole } from './discord/role';
import { default as patchStoreChannel } from './discord/storeChannel';
import { default as patchTextChannel } from './discord/textChannel';
import { default as patchUser } from './discord/user';
import { default as patchVoiceChannel } from './discord/voiceChannel';

export default {
  patchClientUser,
  patchChannel: (n: Partial<APIChannel>, o?: APIChannel) => {
    let patch!: typeof patchGuildChannel;

    switch (n.type) {
      case ChannelType.GUILD_TEXT:
        patch = patchTextChannel;
        break;
      case ChannelType.GUILD_VOICE:
        patch = patchVoiceChannel;
        break;
      case ChannelType.GUILD_STORE:
        patch = patchStoreChannel;
        break;
      case ChannelType.GUILD_CATEGORY:
      case ChannelType.GUILD_NEWS:
        patch = patchGuildChannel;
        break;
      case ChannelType.DM:
        patch = patchDmChannel;
        break;
      default: break;
    }

    return patch(n, o);
  },
  patchDmChannel,
  patchGuild,
  patchGuildChannel,
  patchGuildMember,
  patchMessage,
  patchPresence,
  patchRole,
  patchStoreChannel,
  patchTextChannel,
  patchUser,
  patchVoiceChannel
};

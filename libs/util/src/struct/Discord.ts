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
import { default as patchDmChannel, PatchedDMChannel } from './discord/dmChannel';
import { default as patchGuild } from './discord/guild';
import { default as patchGuildChannel, PatchedGuildChannel } from './discord/guildChannel';
import { default as patchGuildMember } from './discord/guildMember';
import { default as patchMessage } from './discord/message';
import { default as patchPresence } from './discord/presence';
import { default as patchRole } from './discord/role';
import { default as patchStoreChannel, PatchedStoreChannel } from './discord/storeChannel';
import { default as patchTextChannel, PatchedTextChannel } from './discord/textChannel';
import { default as patchUser } from './discord/user';
import { default as patchVoiceChannel, PatchedVoiceChannel } from './discord/voiceChannel';

export type PatchedChannel = PatchedDMChannel | PatchedGuildChannel | PatchedStoreChannel | PatchedTextChannel | PatchedVoiceChannel;

export default {
  patchClientUser,
  patchChannel: <T extends PatchedChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
    let res!: {
      data: PatchedGuildChannel | PatchedTextChannel | PatchedVoiceChannel | PatchedStoreChannel | PatchedDMChannel;
      old: T | undefined;
    };

    switch (n.type) {
      case ChannelType.GUILD_TEXT: res = patchTextChannel(n, o);
      case ChannelType.GUILD_VOICE: res = patchVoiceChannel(n, o);
      case ChannelType.GUILD_STORE: res = patchStoreChannel(n, o);
      case ChannelType.GUILD_CATEGORY:
      case ChannelType.GUILD_NEWS: res = patchGuildChannel(n, o);
      case ChannelType.DM: res = patchDmChannel(n, o);
      default: break;
    }

    return res;
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

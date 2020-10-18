import { APIChannel, ChannelType } from 'discord-api-types';

import { patch as patchClientUser } from './discord/clientUser';
import { patch as patchDmChannel } from './discord/dmChannel';
import { patch as patchGuild } from './discord/guild';
import { patch as patchGuildChannel } from './discord/guildChannel';
import { patch as patchGuildMember } from './discord/guildMember';
import { patch as patchMessage } from './discord/message';
import { patch as patchPresence } from './discord/presence';
import { patch as patchRole } from './discord/role';
import { patch as patchStoreChannel } from './discord/storeChannel';
import { patch as patchTextChannel } from './discord/textChannel';
import { patch as patchUser } from './discord/user';
import { patch as patchVoiceChannel } from './discord/voiceChannel';

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

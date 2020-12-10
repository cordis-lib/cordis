import { APIChannel, ChannelType } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';
import { default as patchGuildChannel, PatchedAPIGuildChannel } from './guildChannel';

export interface PatchedAPIStoreChannel extends RequiredProp<Omit<PatchedAPIGuildChannel, 'type'>, 'nsfw'> {
  type: ChannelType.GUILD_STORE;
}

export default <T extends PatchedAPIStoreChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o as any);

  const data = oldChannel ?? newChannel;

  const {
    nsfw
  } = n;

  data.nsfw = nsfw ?? data.nsfw ?? false;

  return {
    data: data as PatchedAPIStoreChannel,
    old: oldChannel
  };
};

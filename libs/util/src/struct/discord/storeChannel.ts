import { APIChannel, ChannelType } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';
import { default as patchGuildChannel, PatchedGuildChannel } from './guildChannel';

export interface PatchedStoreChannel extends RequiredProp<Omit<PatchedGuildChannel, 'type'>, 'nsfw'> {
  type: ChannelType.GUILD_STORE;
}

export default <T extends APIChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel<T>(n, o);

  const data = oldChannel ?? newChannel;

  const {
    nsfw
  } = n;

  data.nsfw = nsfw ?? data.nsfw ?? false;

  return {
    data: data as PatchedStoreChannel,
    old: oldChannel
  };
};

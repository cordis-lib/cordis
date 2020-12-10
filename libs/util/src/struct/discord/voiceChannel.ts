import { APIChannel, ChannelType } from 'discord-api-types';
import { default as patchGuildChannel, PatchedGuildChannel } from './guildChannel';

export interface PatchedVoiceChannel extends Omit<PatchedGuildChannel, 'type'> {
  type: ChannelType.GUILD_VOICE;
}

export default <T extends PatchedVoiceChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o as any);

  const data = oldChannel ?? newChannel;

  const {
    bitrate,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    user_limit
  } = n;

  data.bitrate = bitrate ?? data.bitrate;
  data.user_limit = user_limit ?? data.user_limit;

  return {
    data: data as PatchedVoiceChannel,
    old: oldChannel
  };
};

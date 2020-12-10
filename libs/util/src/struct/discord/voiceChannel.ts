import { APIChannel, ChannelType } from 'discord-api-types';
import { default as patchGuildChannel, PatchedAPIGuildChannel } from './guildChannel';

export interface PatchedAPIVoiceChannel extends Omit<PatchedAPIGuildChannel, 'type'> {
  type: ChannelType.GUILD_VOICE;
}

export default <T extends PatchedAPIVoiceChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
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
    data: data as PatchedAPIVoiceChannel,
    old: oldChannel
  };
};

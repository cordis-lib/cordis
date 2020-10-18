import { APIChannel } from 'discord-api-types';
import { patch as patchGuildChannel } from './guildChannel';

export const patch = (n: Partial<APIChannel>, o?: APIChannel | null) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o);

  const data = oldChannel ?? newChannel;

  const {
    bitrate,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    user_limit
  } = n;

  if (bitrate !== undefined) data.bitrate = bitrate;
  if (user_limit !== undefined) data.user_limit = user_limit;

  return {
    data,
    old: oldChannel
  };
};

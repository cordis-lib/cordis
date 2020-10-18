import { APIChannel } from 'discord-api-types';
import { patch as patchGuildChannel } from './guildChannel';

export const patch = (n: Partial<APIChannel>, o?: APIChannel | null) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o);

  const data = oldChannel ?? newChannel;

  const {
    nsfw
  } = n;

  if (nsfw !== undefined) data.nsfw = nsfw;

  return {
    data,
    old: oldChannel
  };
};

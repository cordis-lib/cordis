import { APIChannel } from 'discord-api-types';
import { patch as patchGuildChannel } from './guildChannel';

export const patch = (n: Partial<APIChannel>, o?: APIChannel | null) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o);

  const data = oldChannel ?? newChannel;

  const {
    topic,
    nsfw,
    /* eslint-disable @typescript-eslint/naming-convention */
    last_message_id,
    rate_limit_per_user,
    last_pin_timestamp
  } = n;

  data.topic = topic ?? data.topic ?? null;
  if (nsfw !== undefined) data.nsfw = nsfw;
  if (last_message_id !== undefined) data.last_message_id = last_message_id;
  if (rate_limit_per_user !== undefined) data.rate_limit_per_user = rate_limit_per_user;
  if (last_pin_timestamp) data.last_pin_timestamp = last_pin_timestamp;

  return {
    data,
    old: oldChannel
  };
};

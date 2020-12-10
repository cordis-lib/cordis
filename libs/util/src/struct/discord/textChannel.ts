import { APIChannel, ChannelType } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';
import { default as patchGuildChannel, PatchedGuildChannel } from './guildChannel';

export interface PatchedTextChannel extends RequiredProp<
Omit<PatchedGuildChannel, 'type'>,
'topic' | 'nsfw' | 'last_message_id' | 'last_pin_timestamp'
> {
  type: ChannelType.GUILD_TEXT;
}

export default <T extends PatchedTextChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const { data: newChannel, old: oldChannel } = patchGuildChannel(n, o as any);

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
  data.nsfw = nsfw ?? data.nsfw ?? false;
  data.last_message_id = last_message_id ?? data.last_message_id ?? null;
  data.rate_limit_per_user = rate_limit_per_user ?? data.rate_limit_per_user;
  data.last_pin_timestamp = last_pin_timestamp ?? data.last_pin_timestamp ?? null;

  return {
    data: data as PatchedTextChannel,
    old: oldChannel
  };
};

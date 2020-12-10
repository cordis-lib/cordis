import { APIChannel, ChannelType } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedGuildChannel extends RequiredProp<Omit<APIChannel, 'type'>, 'name' | 'guild_id'> {
  type: ChannelType.GUILD_CATEGORY | ChannelType.GUILD_NEWS;
}

export default <T extends PatchedGuildChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const data = o ?? n;

  const {
    name,
    position,
    parent_id, // eslint-disable-line @typescript-eslint/naming-convention
    permission_overwrites // eslint-disable-line @typescript-eslint/naming-convention
  } = n;

  data.name = name ?? data.name;
  data.position = position ?? data.position;
  data.parent_id = parent_id ?? data.parent_id;
  data.permission_overwrites = permission_overwrites ?? data.permission_overwrites;

  return {
    data: data as PatchedGuildChannel,
    old: o as T
  };
};

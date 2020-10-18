import { APIChannel } from 'discord-api-types';

export const patch = (n: Partial<APIChannel>, o?: APIChannel | null) => {
  const data = o ?? n;

  const {
    name,
    position,
    parent_id, // eslint-disable-line @typescript-eslint/naming-convention
    permission_overwrites // eslint-disable-line @typescript-eslint/naming-convention
  } = n;

  if (name) data.name = name;
  if (position !== undefined) data.position = position;
  if (parent_id) data.parent_id = parent_id;
  if (permission_overwrites) data.permission_overwrites = permission_overwrites;

  return {
    data: data as APIChannel,
    old: o
  };
};

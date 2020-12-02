import { APIRole } from 'discord-api-types';

export default (n: Partial<APIRole>, o?: APIRole | null) => {
  const data = o ?? n;

  const {
    name,
    color,
    hoist,
    position,
    permissions,
    managed,
    mentionable
  } = n;

  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;
  if (hoist !== undefined) data.hoist = hoist;
  if (position !== undefined) data.position = position;
  if (permissions !== undefined) data.permissions = permissions;
  if (managed !== undefined) data.managed = managed;
  if (mentionable !== undefined) data.mentionable = mentionable;

  return {
    data: data as APIRole,
    old: o
  };
};

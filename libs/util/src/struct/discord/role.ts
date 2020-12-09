import { APIRole } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedRole extends RequiredProp<APIRole, 'hoist' | 'permissions' | 'managed' | 'mentionable'> {}

export default <T extends APIRole | null | undefined>(n: Partial<APIRole>, o?: T) => {
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

  data.name = name ?? data.name;
  data.color = color ?? data.color;
  data.hoist = hoist ?? data.hoist ?? false;
  data.position = position ?? data.position;
  data.permissions = permissions ?? data.permissions ?? '0';
  data.managed = managed ?? data.managed ?? false;
  data.mentionable = mentionable ?? data.mentionable ?? false;

  return {
    data: data as PatchedRole,
    old: o as T
  };
};

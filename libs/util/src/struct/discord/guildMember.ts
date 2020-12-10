import { APIGuildMember } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';
import { default as patchUser, PatchedUser } from './user';

export interface PatchedGuildMember extends RequiredProp<APIGuildMember, 'mute' | 'deaf'> {}

export default <T extends PatchedGuildMember | null | undefined>(n: Partial<APIGuildMember>, o?: T) => {
  const data = o ?? n;

  /* eslint-disable @typescript-eslint/naming-convention */
  const {
    user,
    nick,
    joined_at,
    premium_since,
    roles,
    mute,
    deaf
  } = n;
  /* eslint-enable @typescript-eslint/naming-convention */

  const extras = {
    oldUser: null as PatchedUser | null,
    newUser: null as PatchedUser | null,
    roles: [] as unknown as [string[], string[]]
  };

  if (user) {
    const { data: newUser, old: oldUser = null } = patchUser(user, data.user as any);
    extras.oldUser = oldUser;
    extras.newUser = newUser;

    data.user = newUser;
  }

  data.nick = nick ?? data.nick;
  data.joined_at = joined_at ?? data.joined_at;
  data.premium_since = premium_since ?? data.premium_since;
  data.mute = mute ?? data.mute ?? false;
  data.deaf = deaf ?? data.deaf ?? false;

  if (roles) {
    extras.roles.push(data.roles ?? [], roles);
    data.roles = roles;
  }

  return {
    data: data as PatchedGuildMember,
    old: o as T,
    ...extras
  };
};

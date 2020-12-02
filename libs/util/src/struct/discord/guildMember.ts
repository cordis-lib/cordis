import { APIGuildMember, APIUser } from 'discord-api-types';
import { default as patchUser } from './user';

export default (n: Partial<APIGuildMember>, o?: APIGuildMember | null) => {
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
    oldUser: null as APIUser | null,
    newUser: null as APIUser | null,
    roles: [] as unknown as [string[], string[]]
  };

  if (user) {
    const { data: newUser, old: oldUser = null } = patchUser(user, data.user);
    extras.oldUser = oldUser;
    extras.newUser = newUser;

    data.user = newUser;
  }

  if (nick !== undefined) data.nick = nick;
  if (joined_at !== undefined) data.joined_at = joined_at;
  if (premium_since !== undefined) data.premium_since = premium_since;
  data.mute = mute ?? data.mute ?? false;
  data.deaf = deaf ?? data.deaf ?? false;

  if (roles) {
    extras.roles.push(data.roles ?? [], roles);
    data.roles = roles;
  }

  return {
    data: data as APIGuildMember,
    old: o,
    ...extras
  };
};

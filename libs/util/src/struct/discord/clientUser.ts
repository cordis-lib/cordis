import { APIUser } from 'discord-api-types';
import { patch as patchUser } from './user';

export const patch = (n: Partial<APIUser>, o?: APIUser | null) => {
  const { data: newUser } = patchUser(n, o);

  const {
    verified,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mfa_enabled
  } = newUser;

  const data = o ?? n;

  data.verified = verified ?? data.verified ?? false;
  data.mfa_enabled = mfa_enabled ?? data.mfa_enabled ?? false;

  return {
    data: data as APIUser,
    old: o
  };
};

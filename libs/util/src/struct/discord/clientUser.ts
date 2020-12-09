import { APIUser } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';
import { default as patchUser } from './user';

export type ExcludedClientUserProperties = 'email' | 'flags' | 'premium_type';

export interface PatchedClientUser extends RequiredProp<
Omit<APIUser, ExcludedClientUserProperties>,
'bot' | 'system' | 'public_flags' | 'verified' | 'mfa_enabled'
> {}

export default <T extends APIUser | null | undefined>(n: Partial<APIUser>, o?: T) => {
  const { data: newUser }: { data: APIUser } = patchUser(n, o) as any;

  const {
    verified,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mfa_enabled
  } = newUser;

  const data = o ?? n;

  data.verified = verified ?? data.verified ?? false;
  data.mfa_enabled = mfa_enabled ?? data.mfa_enabled ?? false;

  return {
    data: data as PatchedClientUser,
    old: o as T
  };
};

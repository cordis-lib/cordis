import { APIUser } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export type ExcludedUserProperties = 'email' | 'flags' | 'mfa_enabled' | 'premium_type' | 'verified';

export interface PatchedUser extends RequiredProp<Omit<APIUser, ExcludedUserProperties>, 'bot' | 'system' | 'public_flags'> {}

export default <T extends PatchedUser | null | undefined>(n: Partial<APIUser>, o?: T) => {
  const data = o ?? n;

  const {
    bot,
    username,
    discriminator,
    avatar,
    system,
    locale,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public_flags
  } = n;

  data.bot = bot ?? data.bot ?? false;
  data.username = username ?? data.username;
  data.discriminator = discriminator ?? data.discriminator;
  data.avatar = avatar ?? data.avatar;
  data.system = system ?? data.system ?? false;
  data.locale = locale ?? data.locale;
  data.public_flags = public_flags ?? data.public_flags ?? 0;

  return {
    data: data as PatchedUser,
    old: o as T
  };
};

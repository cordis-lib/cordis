import { APIUser } from 'discord-api-types';

export const patch = (n: Partial<APIUser>, o?: APIUser | null) => {
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
    data: data as APIUser,
    old: o
  };
};

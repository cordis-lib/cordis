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

  data.bot = bot !== undefined ? bot : (data.bot ?? false);
  if (username !== undefined) data.username = username;
  if (discriminator !== undefined) data.discriminator = discriminator;
  if (avatar !== undefined) data.avatar = avatar;
  if (system !== undefined) data.system = system;
  if (locale !== undefined) data.locale = locale;
  if (public_flags !== undefined) data.public_flags = public_flags;

  return {
    data: data as APIUser,
    old: o
  };
};

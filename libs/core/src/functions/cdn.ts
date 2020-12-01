import { ENDPOINTS, ImageOptions, makeDiscordCdnUrl } from '@cordis/util';
import { FactoryMeta } from '../util/FunctionManager';

interface AvatarOptions {
  id: string;
  avatar: string | null;
}

const userAvatar = ({ user, ...options }: { user: AvatarOptions } & ImageOptions) => {
  if (!user.avatar) return null;
  return makeDiscordCdnUrl(`${ENDPOINTS.cdn}/avatars/${user.id}/${user.avatar}`, options);
};

const defaultUserAvatar = ({ discriminator }: { discriminator: string }) =>
  makeDiscordCdnUrl(`${ENDPOINTS.cdn}/embed/avatars/${discriminator}.png`);

const displayedUserAvatar = ({ user, functions, ...options }: {
  user: AvatarOptions & {
    discriminator: string;
  };
} & ImageOptions & FactoryMeta) =>
  functions.retrieveFunction('userAvatar')({ user, ...options }) ??
  functions.retrieveFunction('defaultUserAvatar')({ discrim: user.discriminator });

export {
  AvatarOptions,
  userAvatar,
  defaultUserAvatar,
  displayedUserAvatar
};

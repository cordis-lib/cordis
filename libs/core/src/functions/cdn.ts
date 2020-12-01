import { ENDPOINTS, ImageOptions, makeDiscordCdnUrl } from '@cordis/util';
import { FactoryMeta } from '../util/FunctionManager';

interface AvatarOptions {
  id: string;
  avatar: string | null;
}

const userAvatar = (user: AvatarOptions, options?: ImageOptions | null) => {
  if (!user.avatar) return null;
  return makeDiscordCdnUrl(`${ENDPOINTS.cdn}/avatars/${user.id}/${user.avatar}`, options);
};

const defaultUserAvatar = (discriminator: string) => makeDiscordCdnUrl(`${ENDPOINTS.cdn}/embed/avatars/${discriminator}.png`);

const displayedUserAvatar = (
  user: AvatarOptions & { discriminator: string },
  options: ImageOptions | null,
  { functions: { retrieveFunction } }: FactoryMeta
) => retrieveFunction('userAvatar')(user, options) ?? retrieveFunction('defaultUserAvatar')(user.discriminator);

export {
  AvatarOptions,
  userAvatar,
  defaultUserAvatar,
  displayedUserAvatar
};

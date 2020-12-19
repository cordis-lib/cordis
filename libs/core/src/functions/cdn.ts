import { ENDPOINTS, ImageOptions, makeDiscordCdnUrl } from '@cordis/util';
import type { FactoryMeta } from '../FunctionManager';
import type { UserAvatarOptions } from '../Types';

/**
 * Gets a CDN URL to a user's avatar
 */
const userAvatar = (user: UserAvatarOptions, options?: ImageOptions | null) => {
  if (!user.avatar) return null;
  return makeDiscordCdnUrl(`${ENDPOINTS.cdn}/avatars/${user.id}/${user.avatar}`, options);
};

/**
 * Gets a user's "default" Discord avatar
 */
const defaultUserAvatar = (discriminator: string) => makeDiscordCdnUrl(`${ENDPOINTS.cdn}/embed/avatars/${discriminator}.png`);

/**
 * Gets a user's "displayed" avatar, what you would see via the client.
 */
const displayedUserAvatar = (
  user: UserAvatarOptions & { discriminator: string },
  options: ImageOptions | null,
  { functions: { retrieveFunction } }: FactoryMeta
) => retrieveFunction('userAvatar')(user, options) ?? retrieveFunction('defaultUserAvatar')(user.discriminator);

export {
  userAvatar,
  defaultUserAvatar,
  displayedUserAvatar
};

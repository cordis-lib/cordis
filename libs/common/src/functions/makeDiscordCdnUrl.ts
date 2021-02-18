import { CordisUtilTypeError, CordisUtilRangeError } from '../error';

/**
 * Valid image formats
 */
export type ImageFormat = 'webp' | 'png' | 'jpg' | 'gif';
/**
 * Valid image sizes
 */
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;

/**
 * Options for generating a URL
 */
export interface ImageOptions {
  /**
   * Desired format to use
   */
  format?: ImageFormat;
  /**
   * Desired size for the image
   */
  size?: ImageSize;
  /**
   * Wether or not automatic gif detection should be attempted
   */
  dynamic?: boolean;
}

/**
 * Generates an image URL for Discord's CDN
 * @param root The root for the image
 * @param options Options for the image
 */
export const makeDiscordCdnUrl = (root: string, options?: ImageOptions | null) => {
  let {
    dynamic = true,
    format = 'webp',
    size
  } = options ?? {};

  const hash = root.split('/').pop()!;
  if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;

  if (!['webp', 'png', 'jpg', 'gif'].includes(format)) throw new CordisUtilTypeError('badImageFormat', format);
  if (size && ![16, 32, 64, 128, 256, 512, 1024, 2048].includes(size)) throw new CordisUtilRangeError('badImageSize', size);

  return `${root}.${format}${size ? `?size=${size}` : ''}`;
};

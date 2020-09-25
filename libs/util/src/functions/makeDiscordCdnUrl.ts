import { CordisUtilTypeError, CordisUtilRangeError } from '../error';

export type ImageFormat = 'webp' | 'png' | 'jpg' | 'gif';
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;

export interface ImageOptions {
  format?: ImageFormat;
  size?: ImageSize;
  dynamic?: boolean;
}

/**
 * Generates an image URL for Discord's CDN
 * @param root The root for the image
 * @param options Options for the image
 */
export const makeDiscordCdnUrl = (root: string, options?: ImageOptions) => {
  let {
    dynamic = true,
    format = 'webp',
    size
  } = options ?? {};

  const hash = root.split('/').pop()!;
  if (dynamic) format = hash.startsWith('_a') ? 'gif' : format;

  if (!['webp', 'png', 'jpg', 'gif'].includes(format)) throw new CordisUtilTypeError('badImageFormat', format);
  if (size && ![16, 32, 64, 128, 256, 512, 1024, 2048].includes(size)) throw new CordisUtilRangeError('badImageSize');

  return `${root}.${format}${size ? `?size=${size}` : ''}`;
};

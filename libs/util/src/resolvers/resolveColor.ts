import { CordisUtilTypeError, CordisUtilRangeError } from '../error';

export type ColorResolvable = string | number | number[];

export const resolveColor = (color: ColorResolvable) => {
  if (Array.isArray(color)) {
    if (color.length !== 3) throw new CordisUtilRangeError('badRgbArrayLength', color.length);
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  } else if (typeof color == 'string') {
    color = parseInt(color.replace('#', ''), 16);
  }

  if (color < 0 || color > 0xffffff) throw new CordisUtilRangeError('badColorRange');
  else if (color && isNaN(color)) throw new CordisUtilTypeError('badColorType');

  return color;
};

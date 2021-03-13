import makeCordisError from '@cordis/error';

/**
 * @internal
 */
export const CordisUtilTypeError = makeCordisError(
  TypeError,
  {
    badImageFormat: (format: string) => `Recieved a bad image format "${format}"`
  }
);

/**
 * @internal
 */
export const CordisUtilRangeError = makeCordisError(
  RangeError,
  {
    badImageSize: (size: number) => `Bad image size given ${size}`
  }
);

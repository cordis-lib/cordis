import makeCordisError from '@cordis/error';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisUtilTypeError = makeCordisError(
  TypeError,
  {
    badImageFormat: (format: string) => `Recieved a bad image format "${format}"`
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisUtilRangeError = makeCordisError(
  RangeError,
  {
    badImageSize: (size: number) => `Bad image size given ${size}`
  }
);

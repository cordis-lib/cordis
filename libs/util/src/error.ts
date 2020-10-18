export const makeCordisError = <K extends string>(base: ErrorConstructor, messages: Record<K, string | ((...args: any[]) => string)>) =>
  class CordisError extends base {
    public code: string;

    public constructor(key: K, ...args: any[]) {
      const message = messages[key] as string | ((...args: any[]) => string);
      super(
        typeof message === 'string'
          ? message
          : message(...args)
      );

      Error.captureStackTrace(this);
      this.code = key;
    }

    public get name() {
      return `${super.name} [${this.code}]`;
    }
  };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisUtilTypeError = makeCordisError(
  TypeError,
  {
    badImageFormat: (format: string) => `Recieved a bad image format "${format}"`,
    badColorType: 'Failed to resolve color, expected a string, a number, or a an array of numbers'
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisUtilRangeError = makeCordisError(
  RangeError,
  {
    badImageSize: (size: number) => `Bad image size given ${size}`,
    badColorRange: 'Was given a bad color range, expected > 0 & < 0xffffff',
    badRgbArrayLength: (size: number) => `Expexted a length of 3, but got ${size}`,
    bitfieldInvalid: 'Failed to resolve bits; expected a bigint, string, a Bitfield, or an array of any of the previous'
  }
);

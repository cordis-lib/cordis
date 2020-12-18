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
    noReduceEmptyStore: 'Cannot reduce an empty store without an initial value'
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisUtilRangeError = makeCordisError(
  RangeError,
  {
    badImageSize: (size: number) => `Bad image size given ${size}`,
    bitfieldInvalid: 'Failed to resolve bits; expected a bigint, string, a Bitfield, or an array of any of the previous'
  }
);

import { makeCordisError } from '@cordis/util';

/* eslint-disable @typescript-eslint/naming-convention */
export const CordisCoreError = makeCordisError(
  Error,
  {
    entityUnresolved: (entity: string) => `Unable to resolve a required ${entity}`,
    fileNotFound: (file: string) => `Unable to resolve file from path ${file}`
  }
);

export const CordisCoreTypeError = makeCordisError(
  TypeError,
  {
    badColorType: 'Failed to resolve color, expected a string, a number, or a an array of numbers'
  }
);

export const CordisCoreRangeError = makeCordisError(
  RangeError,
  {
    badColorRange: 'Was given a bad color range, expected > 0 & < 0xffffff',
    badRgbArrayLength: (size: number) => `Expexted a length of 3, but got ${size}`
  }
);
/* eslint-enable @typescript-eslint/naming-convention */

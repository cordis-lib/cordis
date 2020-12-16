import { makeCordisError } from '@cordis/util';

/* eslint-disable @typescript-eslint/naming-convention */
export const CordisCoreError = makeCordisError(
  Error,
  {
    entityUnresolved: (entity: string) => `Unable to resolve a required ${entity}`
  }
);

export const CordisCoreTypeError = makeCordisError(
  TypeError,
  {

  }
);
/* eslint-enable @typescript-eslint/naming-convention */

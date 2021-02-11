/**
 * Checks wether or not the given value is a promise
 * @param value The value to check
 */
export const isPromise = (value: any): value is Promise<any> =>
  Boolean(value) &&
  typeof value.then === 'function' &&
  typeof value.catch === 'function';

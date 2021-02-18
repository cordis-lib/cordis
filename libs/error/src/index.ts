/**
 * Callback that can be used to retrieve a dynamic message
 */
export type MessageCallback = (...args: any[]) => string;

/**
 * Creates a cordis error from the given base class
 * @param base Base error class to use
 * @param messages Messages to register
 * @returns A class to construct errors
 */
export const makeCordisError = <K extends string>(base: ErrorConstructor, messages: Record<K, string | MessageCallback>) =>
  class Error extends base {
    public code: K;
    public stack!: string;

    public constructor(key: K, ...args: any[]) {
      const message = messages[key] as string | MessageCallback;
      if (!message) throw new TypeError('Bad error key given');
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

export default makeCordisError;

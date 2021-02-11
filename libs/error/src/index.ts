export = <K extends string>(base: ErrorConstructor, messages: Record<K, string | ((...args: any[]) => string)>) =>
  class Error extends base {
    public code: K;
    public stack!: string;

    public constructor(key: K, ...args: any[]) {
      const message = messages[key] as string | ((...args: any[]) => string);
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

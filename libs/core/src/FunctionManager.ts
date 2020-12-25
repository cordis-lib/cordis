import type { RestManager } from '@cordis/rest';
import type { Gateway } from './services/Gateway';
import type { UserAvatarOptions } from './types';
import type { ArrayHead, ArrayTail, ImageOptions } from '@cordis/util';
import type * as functions from './functions';

interface FactoryMeta {
  functions: FunctionManager;
  rest: RestManager;
  gateway: Gateway;
}

type ExtractMetaParameter<T extends (...args: any) => any> = (...args: ArrayHead<Parameters<T>>) => ReturnType<T>;

// ? This check used to be done in ExtractMetaParameter<T> but unfortunately that meant that every function's return type was mutated by
// ? ReturnType<T>. Initially, this seemed fine, however, as it appears, type-guard functions such as isAPIUser simply resolved to boolean
// ? Currently, this will only work as long as a type guard function doesn't depend on the meta parameter, which shouldn't ever happen anyway
type BuiltInFunctions = {
  [K in keyof Omit<typeof functions, 'displayedUserAvatar'>]: ArrayTail<Parameters<typeof functions[K]>> extends FactoryMeta
    ? ExtractMetaParameter<typeof functions[K]>
    : typeof functions[K];
} & {
  displayedUserAvatar: (user: UserAvatarOptions & { discriminator: string }, options?: ImageOptions | null) => string;
};

class FunctionManager {
  private readonly _entries: BuiltInFunctions = {} as any;
  private readonly _meta: FactoryMeta;

  public constructor(meta: Omit<FactoryMeta, 'functions'>) {
    this._meta = { functions: this, ...meta };
    this._registerBuiltIns();
  }

  public registerFunction<N extends keyof BuiltInFunctions, F extends typeof functions[N]>(name: N, fn: F) {
    // @ts-ignore
    this._entries[name] = (...data: ArrayHead<Parameters<F>>) => fn(...[...data, this._meta]);
  }

  public retrieveFunction<N extends keyof BuiltInFunctions>(name: N): BuiltInFunctions[N] {
    return this._entries[name];
  }

  private _registerBuiltIns() {
    for (const builtIn of ['cdn', 'channel', 'http', 'invite', 'user']) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const data = require(`./${builtIn}`);
      if ('default' in data) {
        this.registerFunction(builtIn as any, data.default);
      }

      for (const key of Object.keys(data)) {
        if (key === 'default') continue;
        this.registerFunction(key as any, data[key]);
      }
    }

    return this;
  }
}

export {
  FactoryMeta,
  BuiltInFunctions,
  FunctionManager
};

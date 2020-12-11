import { ArrayHead, ArrayTail, ImageOptions, RedisStore } from '@cordis/util';
import { Rest } from './services/Rest';
import { Gateway } from './services/Gateway';

import { User, UserAvatarOptions } from './Types';
import * as cdn from './functions/cdn';
import * as http from './functions/http';
import * as invite from './functions/invite';
import * as user from './functions/user';

interface FactoryMeta {
  functions: FunctionManager;
  rest: Rest;
  gateway: Gateway;
  users: RedisStore<User>;
}

type ExtractMetaParameter<T extends (...args: any) => any> = (...args: ArrayHead<Parameters<T>>) => ReturnType<T>;

type BuiltInFunctionsRaw = typeof cdn & typeof http & typeof invite & typeof user;

// ? This check used to be done in ExtractMetaParameter<T> but unfortunately that meant that every function's return type was mutated by
// ? ReturnType<T>. Initially, this seemed fine, however, as it appears, type-guard functions such as isAPIUser simply resolved to boolean
// ? Currently, this will only work as long as a type guard function doesn't depend on the meta parameter, which shouldn't ever happen anyway
type BuiltInFunctions = {
  [K in keyof Omit<BuiltInFunctionsRaw, 'displayedUserAvatar'>]: ArrayTail<Parameters<BuiltInFunctionsRaw[K]>> extends FactoryMeta
    ? ExtractMetaParameter<BuiltInFunctionsRaw[K]>
    : BuiltInFunctionsRaw[K];
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

  public get cdn(): typeof cdn {
    return {
      userAvatar: this.retrieveFunction('userAvatar'),
      defaultUserAvatar: this.retrieveFunction('defaultUserAvatar'),
      displayedUserAvatar: this.retrieveFunction('displayedUserAvatar')
    };
  }

  public registerFunction<N extends keyof BuiltInFunctions, F extends BuiltInFunctionsRaw[N]>(name: N, fn: F) {
    // @ts-ignore
    this._entries[name] = (...data: ArrayHead<Parameters<F>>) => fn(...[...data, this._meta]);
  }

  public retrieveFunction<N extends keyof BuiltInFunctions>(name: N): BuiltInFunctions[N] {
    return this._entries[name];
  }

  private _registerBuiltIns() {
    for (const builtIn of ['cdn', 'http', 'invite', 'user']) {
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
  BuiltInFunctionsRaw,
  BuiltInFunctions,
  FunctionManager
};

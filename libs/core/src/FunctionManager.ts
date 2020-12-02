import { ArrayHead, ArrayTail, ImageOptions, RedisCache } from '@cordis/util';
import { isUser, isCordisUser, sanatizeUser, resolveUser, resolveUserId } from './functions/user';
import { Rest } from './services/Rest';
import {
  userAvatar,
  defaultUserAvatar,
  AvatarOptions
} from './functions/cdn';

interface FactoryMeta {
  functions: FunctionManager;
  rest: Rest;
  cache: RedisCache;
}

type ExtractMetaParameter<T extends (...args: any) => any> = (...args: ArrayHead<Parameters<T>>) => ReturnType<T>;

interface BuiltInFunctionsRaw {
  isUser: typeof isUser;
  isCordisUser: typeof isCordisUser;
  sanatizeUser: typeof sanatizeUser;
  resolveUser: typeof resolveUser;
  resolveUserId: typeof resolveUserId;

  userAvatar: typeof userAvatar;
  defaultUserAvatar: typeof defaultUserAvatar;
  // ? Need to actually mark options as an optional parameter
  displayedUserAvatar: (user: AvatarOptions & { discriminator: string }, options?: ImageOptions | null) => string;
}

// ? This check used to be done in ExtractMetaParameter<T> but unfortunately that meant that every function's return type was mutated by
// ? ReturnType<T>. Initially, this seemed fine, however, as it appears, type-guard functions such as isUser simply resolved to boolean
// ? Currently, this will only work as long as a type guard function doesn't depend on the meta parameter, which shouldn't ever happen anyway
type BuiltInFunctions = {
  [K in keyof BuiltInFunctionsRaw]: ArrayTail<Parameters<BuiltInFunctionsRaw[K]>> extends FactoryMeta
    ? ExtractMetaParameter<BuiltInFunctionsRaw[K]>
    : BuiltInFunctionsRaw[K];
};

class FunctionManager {
  private readonly _entries: BuiltInFunctions = {} as any;
  private readonly _meta: FactoryMeta;

  public constructor(meta: Omit<FactoryMeta, 'functions'>) {
    this._meta = { functions: this, ...meta };
    this._registerBuiltIns();
  }

  public get cdn() {
    return {
      userAvatar: this.retrieveFunction('userAvatar'),
      defaultUserAvatar: this.retrieveFunction('defaultUserAvatar'),
      displayedUserAvatar: this.retrieveFunction('displayedUserAvatar')
    };
  }

  public registerFunction<N extends keyof BuiltInFunctionsRaw>(name: N, fn: BuiltInFunctionsRaw[N]) {
    // @ts-ignore
    this._entries[name] = (...data) => fn(...[...data, this._meta]);
  }

  public retrieveFunction<N extends keyof BuiltInFunctions>(name: N): BuiltInFunctions[N] {
    return this._entries[name];
  }

  private _registerBuiltIns() {
    for (const builtIn of ['cdn', 'user']) {
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
  BuiltInFunctionsRaw as BuiltInFunctions,
  FunctionManager
};

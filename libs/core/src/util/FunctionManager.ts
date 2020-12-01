import { isUser, isCordisUser, sanatizeUser } from '../functions/user';
import { Head } from '@cordis/util';
import {
  userAvatar,
  defaultUserAvatar,
  displayedUserAvatar
} from '../functions/cdn';

interface FactoryMeta {
  functions: FunctionManager;
}

type ExtractMetaParameter<T extends (...args: any) => any> = (...args: Head<Parameters<T>>) => ReturnType<T>;

interface BuiltInFunctions {
  isUser: ExtractMetaParameter<typeof isUser>;
  isCordisUser: typeof isCordisUser;
  sanatizeUser: typeof sanatizeUser;

  userAvatar: ResolveRegisteredFunc<typeof userAvatar>;
  defaultUserAvatar: ResolveRegisteredFunc<typeof defaultUserAvatar>;
  displayedUserAvatar: ResolveRegisteredFunc<typeof displayedUserAvatar>;
}

class FunctionManager { // eslint-disable-line @typescript-eslint/ban-types
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

  public registerFunction<N extends keyof BuiltInFunctions>(name: N, fn: BuiltInFunctions[N]) {
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
  BuiltInFunctions,
  FunctionManager
};

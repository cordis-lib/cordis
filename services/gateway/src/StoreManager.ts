import { RedisStore, StoreOptions } from '@cordis/util';
import { Redis } from 'ioredis';

type RedisOptions = StoreOptions<any, string>;

export class StoreManager {
  public readonly stores = new Map<string, RedisStore<any>>();

  public constructor(public readonly redis: Redis) {}

  public registerStore(options: RedisOptions & { hash: string }) {
    if (!this.stores.has(options.hash)) {
      const store = new RedisStore({ redis: this.redis, ...options });
      this.stores.set(options.hash, store);
      return store;
    }

    return null;
  }

  public get<T>(hash: string, key: string, options?: RedisOptions): Promise<T | null>;
  public get<T>(hash: string, key?: string | null | undefined, options?: RedisOptions): Promise<RedisStore<T>>;
  public get<T>(hash: string, key?: string | null, options?: RedisOptions): Promise<RedisStore<T> | T | null> {
    const store: RedisStore<T> | null = this.stores.get(hash) ?? this.registerStore({ hash, ...options })!;

    return typeof key === 'string' ? store.get(key).then(d => d ?? null) : Promise.resolve(store);
  }

  public async set<T>(hash: string, key: string, value: T, options?: RedisOptions) {
    const store: RedisStore<T> | null = this.stores.get(hash) ?? this.registerStore({ hash, ...options })!;
    await store.set(key, value);
    return this;
  }

  public async delete<T>(hash: string, keys: string | string[] = [], options?: RedisOptions) {
    const store: RedisStore<T> | null = this.stores.get(hash) ?? this.registerStore({ hash, ...options })!;

    keys = Array.isArray(keys) ? keys : [keys];

    if (!keys.length) {
      await store.empty();
      return true;
    }

    let deleted = false;
    for (const key of keys) {
      if (await store.delete(key)) deleted = true;
    }

    return deleted;
  }
}

import { Redis } from 'ioredis';
import { Store, IStore, StoreOptions, StoreSingleEntryCallback, StoreSortCallback, StoreReduceCallback, StoreMapCallback } from '@cordis/store';
import makeCordisError from '@cordis/error';

/**
 * @internal
 */
export const CordisRedisStoreTypeError = makeCordisError(TypeError, {
  noReduceEmptyStore: 'Cannot reduce an empty store without an initial value'
});

/**
 * Callback used to encode a value for inserting into redis
 */
export type EncodeCallback<T> = (value: T) => any;

/**
 * Callback used to decode a value when selecting from redis
 */
export type DecodeCallback<T> = (value: any) => T;

/**
 * Option specific to the redis store
 */
export interface RedisStoreOptions<T> extends StoreOptions<T> {
  /**
   * IORedis client instance
   */
  redis: Redis;
  /**
   * The hash being used to store this data
   */
  hash: string;
  /**
   * Function applied to values before inserting them into Redis
   */
  encode?: (value: T) => any;
  /**
   * Function applied to values before returning them from Redis
   */
  decode?: (value: any) => T;
}

/**
 * **Async**, Redis implementation of the Store
 *
 * Please refer to the {@link IStore} documentation for methods not properly documented on this page.
 * @noInheritDoc
 */
export class RedisStore<T> implements IStore<T> {
  /**
   * Async iterator over the redis store
   */
  public async *[Symbol.asyncIterator]() {
    const raw = await this.redis.hgetall(this.hash);

    for (const entry of Object.keys(raw)) {
      yield [entry, this.decode(raw[entry])] as [string, T];
    }
  }

  /**
   * Hash being used to store data into
   */
  public readonly hash: string;
  /**
   * Redis client
   */
  public readonly redis: Redis;
  /**
   * Max size of this store
   */
  public readonly maxSize: number | null;
  /**
   * How often to empty the store
   */
  public readonly emptyEvery: number | null;
  /**
   * The callback to use to decide which elements to delete when emptying
   */
  public readonly emptyCb: StoreSingleEntryCallback<T> | null;
  /**
   * Callback used to encode data
   */
  public readonly encode: EncodeCallback<T>;
  /**
   * Callback used to decode data
   */
  public readonly decode: DecodeCallback<T>;
  /**
   * The active timer clearing the store - stored so it is actually possible to clear it
   */
  public readonly emptyTimer: NodeJS.Timer | null;

  public constructor(options: RedisStoreOptions<T>) {
    this.hash = options.hash;
    this.redis = options.redis;
    this.maxSize = options.maxSize ?? null;
    this.emptyEvery = options.emptyEvery ?? null;
    this.emptyCb = options.emptyCb ?? null;
    this.encode = options.encode ?? (data => data);
    this.decode = options.decode ?? (data => data);

    if (options.entries) {
      for (const [id, presence] of options.entries) void this.set(id, presence);
    }

    if (this.emptyEvery) this.emptyTimer = setInterval(() => void (this.emptyCb ? this.empty(this.emptyCb) : this.empty()), this.emptyEvery);
    else this.emptyTimer = null;
  }

  public async get(key: string) {
    const data = await this.redis.hget(this.hash, key);
    if (!data) return;

    return this.decode(data);
  }

  /**
   * Retrieves multiple keys from Redis using a single hmget call.
   * @param keys The keys to retrieve
   * @returns An array of the values
   */
  public async getM(...keys: string[]) {
    const data = await this.redis.hmget(this.hash, ...keys);
    return data.map(e => e ? this.decode(e) : null);
  }

  public async set(key: string, value: T) {
    const size = await this.redis.hlen(this.hash);
    if (this.maxSize && size >= this.maxSize) await this.empty();

    await this.redis.hset(this.hash, key, this.encode(value));
    return this;
  }

  public async delete(key: string) {
    const count = await this.redis.hdel(this.hash, key);
    return count > 0;
  }

  public deleteM(...keys: string[]) {
    return this.redis.hdel(this.hash, ...keys);
  }

  public async findKey(cb: StoreSingleEntryCallback<T>) {
    for await (const [key, value] of this) {
      if (cb(value, key)) return key;
    }
  }

  public async find(cb: StoreSingleEntryCallback<T>) {
    for await (const [key, value] of this) {
      if (cb(value, key)) return value;
    }
  }

  public async filter(cb: StoreSingleEntryCallback<T>) {
    const store = new Store<T>();

    for await (const [key, value] of this) {
      if (cb(value, key)) store.set(key, value);
    }

    return store;
  }

  public async sort(cb: StoreSortCallback<T> = (x, y) => Number(x > y)) {
    const raw = await this.redis.hgetall(this.hash);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const entries = (Object
      .entries(raw)
      .map(([key, value]) => [
        key,
        this.decode(value)
      ]) as [string, T][])
      .sort((a, b) => cb(a[1], b[1], a[0], b[0]));

    return new Store<T>({ entries });
  }

  public async mSort(cb: StoreSortCallback<T> = (x, y) => Number(x > y)) {
    const raw = await this.redis.hgetall(this.hash);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const entries = (Object
      .entries(raw)
      .map(([key, value]) => [
        key,
        this.decode(value)
      ]) as [string, T][])
      .sort((a, b) => cb(a[1], b[1], a[0], b[0]));

    await this.redis.del(this.hash);
    for (const [key, value] of entries) await this.redis.hset(this.hash, key, this.encode(value));

    return new Store<T>({ entries });
  }

  public async map<V = T>(cb: StoreMapCallback<V, T>) {
    const raw = await this.redis.hgetall(this.hash);
    return Object
      .entries(raw)
      .map(([key, value]) => cb(
        this.decode(value),
        key
      ));
  }

  public async empty(cb?: StoreSingleEntryCallback<T>) {
    if (!cb) return this.redis.del(this.hash);

    let deletes = 0;

    for await (const [key, value] of this) {
      if (cb(value, key)) {
        await this.redis.hdel(this.hash, key);
        deletes++;
      }
    }

    return deletes;
  }

  public async reduce<V = T>(cb: StoreReduceCallback<V, T>, initial?: V) {
    let accum: V;

    if (initial != null) {
      accum = initial;
      for await (const [key, value] of this) accum = cb(accum, value, key);
      return accum;
    }

    let first = true;
    for await (const [key, value] of this) {
      if (first) {
        accum = value as any;
        first = false;
        continue;
      }

      accum = cb(accum!, value, key);
    }

    if (first) throw new CordisRedisStoreTypeError('noReduceEmptyStore');

    return accum!;
  }
}

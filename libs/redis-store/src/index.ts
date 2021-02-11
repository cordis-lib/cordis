import { Redis } from 'ioredis';
import { Bag, Store, BagOptions } from '@cordis/bag';
import makeCordisError from '@cordis/error';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisRedisStoreTypeError = makeCordisError(TypeError, {
  noReduceEmptyStore: 'Cannot reduce an empty store without an initial value'
});

export class RedisStore<T> implements Store<T> {
  public async *[Symbol.asyncIterator]() {
    const raw = await this.redis.hgetall(this.hash);

    for (const entry of Object.keys(raw)) {
      yield [entry, this.convertorOut(raw[entry])] as [string, T];
    }
  }

  public readonly hash: string;
  public readonly redis: Redis;
  public readonly maxSize: number | null;
  public readonly emptyEvery: number | null;
  public readonly emptyCb: (value: T, key: string) => boolean;
  public readonly convertorIn: (value: T) => any;
  public readonly convertorOut: (value: any) => T;

  public constructor(options: BagOptions<T> & { redis: Redis; hash: string }) {
    this.hash = options.hash;
    this.redis = options.redis;
    this.maxSize = options.maxSize ?? null;
    this.emptyEvery = options.emptyEvery ?? null;
    this.emptyCb = options.emptyCb ?? (() => true);
    this.convertorIn = options.convertorIn ?? (data => data);
    this.convertorOut = options.convertorOut ?? (data => data);
    if (options.entries) {
      for (const [id, presence] of options.entries) void this.set(id, presence);
    }

    if (this.emptyEvery) setInterval(() => void this.empty(options.emptyCb), this.emptyEvery);
  }

  public async get(key: string) {
    const data = await this.redis.hget(this.hash, key);
    if (!data) return;

    return this.convertorOut(data);
  }

  public async getM(...keys: string[]) {
    const data = await this.redis.hmget(this.hash, ...keys);
    return data.map(e => e ? this.convertorOut(e) : null);
  }

  public async set(key: string, value: T) {
    const size = await this.redis.hlen(this.hash);
    if (this.maxSize && size >= this.maxSize) await this.empty();

    await this.redis.hset(this.hash, key, this.convertorIn(value));
    return this;
  }

  public async delete(key: string) {
    const count = await this.redis.hdel(this.hash, key);
    return count > 0;
  }

  public deleteM(...keys: string[]) {
    return this.redis.hdel(this.hash, ...keys);
  }

  public async findKey(cb: (value: T, key: string) => boolean) {
    for await (const [key, value] of this) {
      if (cb(value, key)) return key;
    }
  }

  public async find(cb: (value: T, key: string) => boolean) {
    for await (const [key, value] of this) {
      if (cb(value, key)) return value;
    }
  }

  public async filter(cb: (value: T, key: string) => boolean) {
    const bag = new Bag<T>();

    for await (const [key, value] of this) {
      if (cb(value, key)) bag.set(key, value);
    }

    return bag;
  }

  public async sort(cb: (firstV: T, secondV: T, firstK: string, secondK: string) => number = (x, y) => Number(x > y)) {
    const raw = await this.redis.hgetall(this.hash);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const entries = (Object
      .entries(raw)
      .map(([key, value]) => [
        key,
        this.convertorOut(value)
      ]) as [string, T][])
      .sort((a, b) => cb(a[1], b[1], a[0], b[0]));

    return new Bag<T>({ entries });
  }

  public async mSort(cb: (firstV: T, secondV: T, firstK: string, secondK: string) => number = (x, y) => Number(x > y)) {
    const raw = await this.redis.hgetall(this.hash);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const entries = (Object
      .entries(raw)
      .map(([key, value]) => [
        key,
        this.convertorOut(value)
      ]) as [string, T][])
      .sort((a, b) => cb(a[1], b[1], a[0], b[0]));

    await this.redis.del(this.hash);
    for (const [key, value] of entries) await this.redis.hset(this.hash, key, this.convertorIn(value));

    return new Bag<T>({ entries });
  }

  public async map<R = T>(cb: (value: T, key: string) => R) {
    const raw = await this.redis.hgetall(this.hash);
    return Object
      .entries(raw)
      .map(([key, value]) => cb(
        this.convertorOut(value),
        key
      ));
  }

  public async empty(cb?: (value: T, key: string) => boolean) {
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

  public async reduce<R = T>(cb: (acc: R, value: T, key: string) => R, initial?: R) {
    let accum: R;

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

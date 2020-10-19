import { CordisUtilTypeError } from '../../error';
import { Store, StoreOptions } from './Store';

/**
 * Utility structure for holding cache in-memory, with a sync api
 */
export class Bag<T> extends Map<string, T> implements Store<T, true> {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async *[Symbol.asyncIterator]() {
    const entries = [...this.entries()];
    for (const entry of entries) yield entry;
  }

  public readonly maxSize: number | null;
  public readonly emptyEvery: number | null;
  public readonly emptyCb: (value: T, key: string) => boolean;

  public constructor(options?: StoreOptions<T>) {
    super(options?.entries);

    this.maxSize = options?.maxSize ?? null;
    this.emptyEvery = options?.emptyEvery ?? null;
    this.emptyCb = options?.emptyCb ?? (() => true);

    if (this.emptyEvery) setInterval(() => this.empty(this.emptyCb), this.emptyEvery);
  }

  public set(key: string, value: T) {
    if (this.maxSize && this.size >= this.maxSize) this.clear();
    return super.set(key, value);
  }

  public findKey(cb: (value: T, key: string) => boolean) {
    for (const [key, value] of this) {
      if (cb(value, key)) return key;
    }
  }

  public find(cb: (value: T, key: string) => boolean) {
    for (const [key, value] of this) {
      if (cb(value, key)) return value;
    }
  }

  public filter(cb: (value: T, key: string) => boolean) {
    return new Bag<T>({
      entries: [...this.entries()].filter(a => cb(a[1], a[0]))
    });
  }

  public sort(cb: (firstV: T, secondV: T, firstK: string, secondK: string) => number = (x, y) => Number(x > y)) {
    return new Bag<T>({
      entries: [...this.entries()].sort((a, b) => cb(a[1], b[1], a[0], b[0]))
    });
  }

  public mSort(cb: (firstV: T, secondV: T, firstKey: string, secondKey: string) => number = (x, y) => Number(x > y)) {
    const sorted = this.sort(cb);

    this.clear();
    for (const [key, value] of sorted) this.set(key, value);

    return this;
  }

  public map<R = T>(cb: (value: T, key: string) => R) {
    const entries = this.values();
    return Array.from({ length: this.size }, () => {
      const [key, value] = entries.next().value;
      return cb(value, key);
    });
  }

  public empty(cb?: (value: T, key: string) => boolean) {
    if (!cb) {
      const size = this.size;
      this.clear();

      return size;
    }

    let deletes = 0;

    for (const [key, value] of this) {
      if (cb(value, key)) {
        this.delete(key);
        deletes++;
      }
    }

    return deletes;
  }

  public reduce<R = T>(cb: (acc: R, value: T, key: string) => R, initial?: R): R {
    let accum: R;

    if (initial != null) {
      accum = initial;
      for (const [key, value] of this) accum = cb(accum, value, key);
      return accum;
    }

    let first = true;
    for (const [key, value] of this) {
      if (first) {
        accum = value as any;
        first = false;
        continue;
      }

      accum = cb(accum!, value, key);
    }

    if (first) throw new CordisUtilTypeError('noReduceEmptyStore');

    return accum!;
  }
}

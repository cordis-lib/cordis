import makeCordisError from '@cordis/error';
import type { Store } from './Store';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisBagTypeError = makeCordisError(TypeError, {
  noReduceEmptyBag: 'Cannot reduce an empty bag without an initial value'
});

export interface BagOptions<T> {
  entries?: ReadonlyArray<readonly [string, T]>;
  maxSize?: number | null;
  emptyEvery?: number | null;
  emptyCb?: (value: T, key: string) => boolean;
}

/**
 * Utility structure for holding cache in-memory, with a sync api
 */
export class Bag<T> extends Map<string, T> implements Store<T> {
  public readonly maxSize: number | null;
  public readonly emptyEvery: number | null;
  public readonly emptyCb: ((value: T, key: string) => boolean) | null;

  public constructor(options?: BagOptions<T>) {
    super(options?.entries);

    this.maxSize = options?.maxSize ?? null;
    this.emptyEvery = options?.emptyEvery ?? null;
    this.emptyCb = options?.emptyCb ?? null;

    if (this.emptyEvery) setInterval(() => this.emptyCb ? this.empty(this.emptyCb) : this.clear(), this.emptyEvery);
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
    const entries = this.entries();
    return Array.from({ length: this.size }, () => {
      const { value: [key, value] } = entries.next();
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

    if (first) throw new CordisBagTypeError('noReduceEmptyBag');

    return accum!;
  }
}

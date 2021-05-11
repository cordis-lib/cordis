import makeCordisError from '@cordis/error';
import type { IStore, StoreMapCallback, StoreReduceCallback, StoreSingleEntryCallback, StoreSortCallback } from './IStore';

/**
 * @internal
 */
export const CordisStoreTypeError = makeCordisError(TypeError, {
  noReduceEmptyStore: 'Cannot reduce an empty store without an initial value'
});

/**
 * Options for constructing a store
 */
export interface StoreOptions<T> {
  /**
   * Pre-existing entries to be automatically added on construction
   */
  entries?: ReadonlyArray<readonly [string, T]> | null;
  /**
   * The max size for this store - if set, the store is automatically cleared when it grows past this size
   */
  maxSize?: number | null;
  /**
   * If set this store will be cleared on this interval using the {@link StoreOptions.emptyCb}
   */
  emptyEvery?: number | null;
  /**
   * The callback used to filter which elements to delete - if none, everything is wiped
   */
  emptyCb?: StoreSingleEntryCallback<T> | null;
}

/**
 * **Sync**, in-memory implementation of the Store, using the built-in Map.
 *
 * Please refer to the {@link IStore} documentation for method details.
 * @noInheritDoc
 */
export class Store<T> extends Map<string, T> implements IStore<T> {
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
   * The active timer clearing the store - stored so it is actually possible to clear it
   */
  public readonly emptyTimer: NodeJS.Timer | null;

  public constructor(options?: StoreOptions<T>) {
    super(options?.entries);

    this.maxSize = options?.maxSize ?? null;
    this.emptyEvery = options?.emptyEvery ?? null;
    this.emptyCb = options?.emptyCb ?? null;

    if (this.emptyEvery) this.emptyTimer = setInterval(() => this.emptyCb ? this.empty(this.emptyCb) : this.clear(), this.emptyEvery);
    else this.emptyTimer = null;
  }

  // Documentation purposes
  public get(key: string) {
    return super.get(key);
  }

  public set(key: string, value: T) {
    if (this.maxSize && this.size >= this.maxSize) this.clear();
    return super.set(key, value);
  }

  public delete(key: string) {
    return super.delete(key);
  }

  public findKey(cb: StoreSingleEntryCallback<T>) {
    for (const [key, value] of this) {
      if (cb(value, key)) return key;
    }
  }

  public find(cb: StoreSingleEntryCallback<T>) {
    for (const [key, value] of this) {
      if (cb(value, key)) return value;
    }
  }

  public filter(cb: StoreSingleEntryCallback<T>) {
    return new Store<T>({
      entries: [...this.entries()].filter(a => cb(a[1], a[0]))
    });
  }

  public sort(cb: StoreSortCallback<T> = (x, y) => Number(x > y)) {
    return new Store<T>({
      entries: [...this.entries()].sort((a, b) => cb(a[1], b[1], a[0], b[0]))
    });
  }

  public mSort(cb: StoreSortCallback<T> = (x, y) => Number(x > y)) {
    const sorted = this.sort(cb);

    this.clear();
    for (const [key, value] of sorted) this.set(key, value);

    return this;
  }

  public map<V = T>(cb: StoreMapCallback<V, T>) {
    const entries = this.entries();
    return Array.from({ length: this.size }, () => {
      const { value: [key, value] } = entries.next();
      return cb(value, key);
    });
  }

  public empty(cb?: StoreSingleEntryCallback<T>) {
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

  public reduce<V = T>(cb: StoreReduceCallback<V, T>, initial?: V): V {
    let accum: V;

    if (initial != null) {
      accum = initial;
      for (const [key, value] of this) accum = cb(accum, value, key);
      return accum;
    }

    let first = true;
    for (const [key, value] of this) {
      if (first) {
        accum = value as unknown as V;
        first = false;
        continue;
      }

      accum = cb(accum!, value, key);
    }

    if (first) throw new CordisStoreTypeError('noReduceEmptyStore');

    return accum!;
  }
}

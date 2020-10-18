export interface BagOptions<T> {
  entries?: ReadonlyArray<readonly [string, T]>;
  maxSize?: number | null;
  emptyEvery?: number | null;
  emptyCb?: (value: T, key: string) => boolean;
}

/**
 * Utility structure for holding cache
 */
export class Bag<T> extends Map<string, T> {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async *[Symbol.asyncIterator]() {
    const entries = [...this.entries()];
    for (const entry of entries) yield entry;
  }

  /**
   * Identifier for this bag, describing what it holds
   */
  public readonly name: string;
  /**
   * The max size for this bag, once it overgrows it is cleared
   */
  public readonly maxSize: number | null;
  /**
   * Empty the bag on this set interval
   */
  public readonly emptyEvery: number | null;
  /**
   * A filter callback for emptying
   */
  public readonly emptyCb: (value: T, key: string) => boolean;

  /**
   * @param api The API manager for this bag
   * @param entries The pre-existing Bag (Map) entries
   * @param options Options for this Bag
   */
  public constructor(name: string, options?: BagOptions<T>) {
    super(options?.entries);

    this.name = name;
    this.maxSize = options?.maxSize ?? null;
    this.emptyEvery = options?.emptyEvery ?? null;
    this.emptyCb = options?.emptyCb ?? (() => true);

    if (this.emptyEvery) setInterval(() => this.empty(this.emptyCb), this.emptyEvery);
  }

  /**
   * Inherited from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
   */
  public set(key: string, value: T) {
    if (this.maxSize && this.size >= this.maxSize) this.clear();
    return super.set(key, value);
  }

  /**
   * Yields back the first key that matches the given search criteria, if any
   * @param cb The search criteria
   */
  public findKey(cb: (value: T, key: string) => boolean) {
    for (const [key, value] of this) {
      if (cb(value, key)) return key;
    }
  }

  /**
   * Yields back the first element that matches the given search criteria, if any
   * @param cb The search criteria
   */
  public find(cb: (value: T, key: string) => boolean) {
    for (const [key, value] of this) {
      if (cb(value, key)) return value;
    }
  }

  /**
   * Filters the bag
   * @param cb The filter criteria
   */
  public filter(cb: (value: T, key: string) => boolean) {
    return new Bag<T>(this.name, {
      entries: [...this.entries()].filter(a => cb(a[1], a[0]))
    });
  }

  /**
   * Sorts the bag with no side-effects, faster when you've got large amounts of data
   * @param cb The sort criteria
   */
  public quickSort(cb: (firstV: T, secondV: T, firstK: string, secondK: string) => number = (x, y) => Number(x > y)) {
    return new Bag<T>(this.name, {
      entries: [...this.entries()].sort((a, b) => cb(a[1], b[1], a[0], b[0]))
    });
  }

  /**
   * Sorts the bag
   * NOTE: This WILL clear it and re-set all of the items in the new order, this could be incredibly slow for large caches!
   * If possible try using {@link Bag.quickSort}
   * @param cb The sort criteria
   */
  public sort(cb: (firstV: T, secondV: T, firstKey: string, secondKey: string) => number = (x, y) => Number(x > y)) {
    const sorted = this.quickSort(cb);
    this.clear();

    for (const [key, value] of sorted) this.set(key, value);

    return new Bag<T>(this.name, { entries: [...this.entries()] });
  }

  /**
   * Creates a new bag where all of the items are put through the callback you give
   * @param cb The function to call on each element
   */
  public map<R = T>(cb: (value: T, key: string) => R) {
    const entries = this.values();
    return Array.from({ length: this.size }, () => {
      const [key, value] = entries.next().value;
      return cb(value, key);
    });
  }

  /**
   * Similar to {@link Bag.filter} but deletes all of the elements that match the criteria, returning the delete count
   * @param cb The clean-up criteria
   */
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

  /**
   * Just like https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
   */
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

    if (first) throw new TypeError('Cannot reduce an empty Bag without an initial value');

    return accum!;
  }
}

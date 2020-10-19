import { Bag } from './Bag';

type ReturnValue<T, S extends boolean> = S extends false ? Promise<T> : T;

/**
 * Key value storage in any medium
 * Implementation can be sync or async, as determined by the S generic
 */
export interface Store<T, S extends boolean = false, I = never> {
  /**
   * Gets an item from the cache
   */
  get(key: string): ReturnValue<T | undefined, S>;
  /**
   * Sets an item in the cache
   */
  set(key: string, value: T): ReturnValue<this, S>;
  /**
   * Deletes an itme from the cache
   */
  delete(key: string): ReturnValue<boolean, S>;
  /**
   * Finds a matching key from the cache
   */
  findKey(cb: (value: T, key: string) => boolean): ReturnValue<string | undefined, S>;
  /**
   * Finds a matching value from the cache
   */
  find(cb: (value: T, key: string) => boolean): ReturnValue<T | undefined, S>;
  /**
   * Returns a bag with the values that match the given criteria
   */
  filter(cb: (value: T, key: string) => boolean): ReturnValue<Bag<T>, S>;
  /**
   * Returns a bag sorted by the given function
   */
  sort(cb?: (firstV: T, secondV: T, firstK: string, secondK: string) => number): ReturnValue<Bag<T>, S>;
  /**
   * Same as {@link Store.sort} but also erases and re-sets all the entries in the given order
   */
  mSort(cb?: (firstV: T, secondV: T, firstK: string, secondK: string) => number): ReturnValue<Bag<T>, S>;
  /**
   * Applies the given function to every value in the cache and returns them as an array
   */
  map<V = T>(cb: (value: T, key: string) => V): ReturnValue<V[], S>;
  /**
   * Clears the cache, by the criteria, if given
   */
  empty(cb?: (value: T, key: string) => boolean): ReturnValue<number, S>;
  /**
   * "Reduces" the cache down to a single element and returns it
   */
  reduce<V = T>(cb: (acc: V, value: T, key: string) => V, initial?: V): ReturnValue<V, S>;

  /**
   * The max size for this cache, once it overgrows it is cleared
   */
  readonly maxSize: number | null;
  /**
   * Empty the bag on this set interval
   */
  readonly emptyEvery: number | null;
  /**
   * A filter callback for emptying
   */
  readonly emptyCb: (value: T, key: string) => boolean;

  readonly convertorIn?: I extends never ? never : (value: T) => I;
  readonly convertorOut?: I extends never ? never : (raw: I) => T;

  [Symbol.iterator]?(): IterableIterator<[string, T]>;
  [Symbol.asyncIterator](): AsyncIterator<[string, T]>;

  [key: string]: any;
}

export interface StoreOptions<T, I = never> {
  entries?: ReadonlyArray<readonly [string, T]>;
  maxSize?: number | null;
  emptyEvery?: number | null;
  emptyCb?: (value: T, key: string) => boolean;
  convertorIn?: I extends never ? never : (value: T) => I;
  convertorOut?: I extends never ? never : (raw: I) => T;
}

export type StoreConstructor<T, S extends boolean = false, I = never> = new(options?: StoreOptions<T>) => Store<T, S, I>;

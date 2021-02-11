import type { Bag } from './Bag';

type RT<T> = T | Promise<T>;

export interface Store<T> {
  /**
   * Gets an item from the cache
   */
  get(key: string): RT<T | undefined>;
  /**
   * Sets an item in the cache
   */
  set(key: string, value: T): RT<this>;
  /**
   * Deletes an itme from the cache
   */
  delete(key: string): RT<boolean>;
  /**
   * Finds a matching key from the cache
   */
  findKey(cb: (value: T, key: string) => boolean): RT<string | undefined>;
  /**
   * Finds a matching value from the cache
   */
  find(cb: (value: T, key: string) => boolean): RT<T | undefined>;
  /**
   * Returns a bag with the values that match the given criteria
   */
  filter(cb: (value: T, key: string) => boolean): RT<Bag<T>>;
  /**
   * Returns a bag sorted by the given function
   */
  sort(cb?: (firstV: T, secondV: T, firstK: string, secondK: string) => number): RT<Bag<T>>;
  /**
   * Same as {@link Store.sort} but also erases and re-sets all the entries in the given order
   */
  mSort(cb?: (firstV: T, secondV: T, firstK: string, secondK: string) => number): RT<Bag<T>>;
  /**
   * Applies the given function to every value in the cache and returns them as an array
   */
  map<V = T>(cb: (value: T, key: string) => V): RT<V[]>;
  /**
   * Clears the cache, by the criteria, if given
   */
  empty(cb?: (value: T, key: string) => boolean): RT<number>;
  /**
   * "Reduces" the cache down to a single element and returns it
   */
  reduce<V = T>(cb: (acc: V, value: T, key: string) => V, initial?: V): RT<V>;

  [Symbol.iterator]?(): IterableIterator<[string, T]>;
  [Symbol.asyncIterator]?(): AsyncIterator<[string, T]>;

  [key: string]: any;
}

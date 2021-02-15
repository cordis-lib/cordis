import type { Store } from './Store';

/**
 * The return value for any store method, ensuring both sync and async APIs are valid
 */
export type StoreReturnT<T> = T | Promise<T>;

/**
 * Represents a callback passed to functions that operates on one entry at a time
 * @param value The value for this iteration
 * @param key The key for this iteration
 */
export type StoreSingleEntryCallback<T> = (value: T, key: string) => boolean;

/**
 * Represents a callback passed to sorting functions
 * @param firstV One of the values for this iteration
 * @param secondV The other value for this iteration
 * @param firstK One of the keys for this iteration
 * @param secondK The other key for this iteration
 * @returns Just like Array.prototype.sort, a number reflecting where your elements should go
 */
export type StoreSortCallback<T> = (firstV: T, secondV: T, firstK: string, secondK: string) => number;

/**
 * Represents a callback used for reducing a store
 * @param acc The "accumulator" - always the value returned by the previous iteration
 * @param value The value for this iteration
 * @param key The key for this iteration
 * @returns The value to pass as the next accumulator
 */
export type StoreReduceCallback<V, T> = (acc: V, value: T, key: string) => V;

/**
 * Represents a callback used to map a store entry to a single value
 * @param value The value for this iteration
 * @param key The key for this iteration
 * @returns The new value
 */
export type StoreMapCallback<V, T> = (value: T, key: string) => V;

/**
 * Base store layout
 */
export interface IStore<T> {
  /**
   * Gets an item from the store
   * @param key Key for the value to retrieve
   * @returns The value associated with the key, or undefined if one doesn't exist
   */
  get(key: string): StoreReturnT<T | undefined>;
  /**
   * Sets an item in the store
   * @param key Key for the pair
   * @param value Value for the pair
   * @returns The current instance of the store
   */
  set(key: string, value: T): StoreReturnT<this>;
  /**
   * Deletes an itme from the store
   * @param key The key to delete
   * @returns A boolean, reflecting if the key existed or not
   */
  delete(key: string): StoreReturnT<boolean>;
  /**
   * Finds a matching key from the store
   * @param cb The callback used to check against each entry
   * @returns The first matching entry, or undefined if one doesn't exist
   */
  findKey(cb: StoreSingleEntryCallback<T>): StoreReturnT<string | undefined>;
  /**
   * Finds a matching value from the store
   * @param cb The callback used to check against each entry
   * @returns The first matching entry, or undefined if one doesn't exist
   */
  find(cb: StoreSingleEntryCallback<T>): StoreReturnT<T | undefined>;
  /**
   * Filters a store down to specific elements
   * @param cb The callback to check against each entry
   * @returns A built-in memory store with the values that match the given criteria
   */
  filter(cb: StoreSingleEntryCallback<T>): StoreReturnT<Store<T>>;
  /**
   * Sorts a store by your given callback
   * @param cb The callback used to determine where each entry goes
   * @returns A built-in memory store with the values sorted
   */
  sort(cb?: StoreSortCallback<T>): StoreReturnT<Store<T>>;
  /**
   * Same as {@link Store.sort} but also erases and re-sets all the entries in the given order - avoid for large data sets
   * @param cb The callback used to determine where each entry goes
   * @returns A built-in memory store with the values sorted
   */
  mSort(cb?: StoreSortCallback<T>): StoreReturnT<Store<T>>;
  /**
   * Applies the given function to every value in the store and returns them as an array
   * @param cb The callback to use on each element
   * @returns An array of the resulting values
   */
  map<V = T>(cb: StoreMapCallback<V, T>): StoreReturnT<V[]>;
  /**
   * Clears the store, by the criteria, if given
   * @param cb Criteria to delete by
   * @returns The amount of entries deleted
   */
  empty(cb?: StoreSingleEntryCallback<T>): StoreReturnT<number>;
  /**
   * Reduces the store down to a single element and returns it
   * @param cb The function to use
   * @param initial Optionally, a starting value
   * @returns The value we're left with once we're done with all the entries
   */
  reduce<V = T>(cb: StoreReduceCallback<V, T>, initial?: V): StoreReturnT<V>;

  /**
   * Sync iterator over the implemented store
   */
  [Symbol.iterator]?(): IterableIterator<[string, T]>;
  /**
   * Async iterator over the implemented store
   */
  [Symbol.asyncIterator]?(): AsyncIterator<[string, T]>;
}

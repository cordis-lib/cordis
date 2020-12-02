/**
 * Extracts the head of an array type, if possible.
 * Will obviously only work on tuples with set lengths
 */
export type ArrayHead<T extends any[]> = T extends [infer E] ? [E] : (T extends [...infer Head, any] ? Head : any[]);

/**
 * Extracts the tail of an array type, if possible.
 * Will obviously only work on tuples with set lengths
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ArrayTail<T extends any[]> = T extends [...infer _Head, infer Tail] ? Tail : any[];

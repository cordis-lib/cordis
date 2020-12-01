/**
 * Extracts the head of an array type, if possible.
 * Will obviously only work on tuples with set lengths
 */
export type Head<T extends any[]> = T extends [...infer Head, any] ? Head : any[];

/**
 * Extracts the tail of an array type, if possible.
 * Will obviously only work on tuples with set lengths
 */
export type Tail<T extends any[]> = T extends [any, ...infer Tail] ? Tail : any[];

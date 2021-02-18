/**
 * Creates a "key mirror"
 * @example
 * ```js
 * keyMirror(["a", "b", "c"]);
 * // Expected output: { a: "a", b: "b", c: "c" }
 * ```
 */
export const keyMirror = <T extends string>(keys: T[]) => Object.fromEntries(keys.map(k => [k, k])) as { [K in T]: K };

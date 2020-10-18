/**
 * Creates a "key mirror"
 * Dunno how to explain this besides ["a", "b", "c"] => { a: "a", b: "b", c: "c" }
 */
export const keyMirror = <T extends string>(keys: T[]) => Object.fromEntries(keys.map(k => [k, k])) as { [K in T]: K };

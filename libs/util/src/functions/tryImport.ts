/**
 * Attempts to import an optional dependency
 * @param lib Module you're attempting to import
 */
export const tryImport = <T>(lib: string): T | null => {
  try {
    return require(lib);
  } catch {
    return null;
  }
};

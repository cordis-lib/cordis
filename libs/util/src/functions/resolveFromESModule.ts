/**
 * Tries to resolve.. something from an ES module
 * @param mod Resolved module, either via require or import
 */
export const resolveFromESModule = (mod: any) => {
  if (typeof mod !== 'object') return mod;
  if ('default' in mod) return mod.default;

  const values = Object.values(mod);

  switch (values.length) {
    case 0: return null;
    case 1: return values[0];
    default: return mod;
  }
};

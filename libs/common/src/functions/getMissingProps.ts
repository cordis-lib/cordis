/**
 * Returns the missing properties from a given payload. given an array of required properties
 * @param data The data to check
 * @param schema The properties required
 */
export const getMissingProps = (data: any, schema: string[]) => {
  const missing: string[] = [];

  for (const key of schema) {
    if (!(key in data)) {
      missing.push(key);
    }
  }

  return missing;
};

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * @internal
 */
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

/**
 * Meta properties for cordis (version, github URL)
 */
export const CORDIS_META: {
  url: string;
  version: string;
} = {
  url: pkg.homepage.split('#')[0],
  version: pkg.version
} as const;

Object.freeze(CORDIS_META);

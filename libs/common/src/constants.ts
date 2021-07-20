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

/**
 * Root endpoints for Discord
 */
// TODO: Start using discord-api-types roots once that's released. Already on main branch
export const ENDPOINTS = {
  api: 'https://discord.com/api',
  cdn: 'https://cdn.discordapp.com',
  invite: 'https://discord.gg'
} as const;

Object.freeze(ENDPOINTS);

import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export const CORDIS_META: {
  url: string;
  version: string;
} = {
  url: pkg.homepage.split('#')[0],
  version: pkg.version
};

export const ENDPOINTS = {
  api: 'https://discord.com/api/v7',
  cdn: 'https://cdn.discordapp.com',
  invite: 'https://discord.gg'
};

import { ENDPOINTS } from '@cordis/common';
import { TextDecoder } from 'util';
import type { GatewayReceivePayload } from 'discord-api-types/v8';

const TD = new TextDecoder();

/**
 * Possible encoding types
 */
export type Encoding = 'json' | 'etf';

export const normalCloseCode = 1000;
export const restartingCloseCode = 4900;

/**
 * Installed erlpack instance, if any
 */
export let erlpack: typeof import('erlpack') | null;

try {
  erlpack = require('erlpack');
} catch {
  erlpack = null;
}

/**
 * Installed zlib instance, if any
 */
export let zlib: typeof import('zlib-sync') | null;

try {
  zlib = require('zlib-sync');
} catch {
  zlib = null;
}

/**
 * Default encoding to use
 * "etf" if erlpack is found, otherwise JSON
 */
export const defaultEncoding: Encoding = erlpack ? 'etf' : 'json';

/**
 * If, by default, compression will be used
 * true if zlib-sync is found, otherwise false
 */
export const defaultCompress = Boolean(zlib);

/**
 * Packs data to the appropriate encoding
 * @param encoding Encoding to pack to
 * @param data Data to pack
 */
export const pack = (encoding: Encoding, data: any) => encoding === 'etf' && erlpack
  ? erlpack.pack(data)
  : JSON.stringify(data);

/**
 * Unpacks (decompressed) data given from Discord
 * @param encoding The encoding to unpack from
 * @param data Data to unpack
 */
export const unpack = (encoding: Encoding, data: any): GatewayReceivePayload => {
  if (encoding === 'json' || !erlpack) {
    if (typeof data !== 'string') data = TD.decode(data);
    return JSON.parse(data);
  }

  if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
  return data.length ? erlpack.unpack(data) : {};
};

export const CONSTANTS = {
  gateway: `${ENDPOINTS.api}/gateway/bot`,
  properties: {
    $os: process.platform,
    $browser: 'cordis',
    $device: 'cordis'
  }
};

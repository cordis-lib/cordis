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

/**
 * Interface representing configuration for the gateway service
 */
export interface GatewayServiceConfig {
  auth: string;
  amqpHost: string;
  debug: boolean;
  shardCount: number | 'auto';
  startingShard: number;
  totalShardCount: number | 'auto';
  ws: {
    compress: boolean;
    encoding: 'json' | 'etf';
    timeouts: {
      open: number;
      hello: number;
      ready: number;
      guild: number;
      reconnect: number;
    };
    largeThreshold: number;
    intents: string[];
  };
}

/**
 * Injection tokens used by the gateway service
 */
export const GATEWAY_INJECTION_TOKENS = {
  kConfig: Symbol('parsed configuration options'),
  amqp: {
    kChannel: Symbol('amqp channel object'),
    kConnection: Symbol('amqp connection object'),
    kService: Symbol('RoutingServer instance for distributing the incoming packets'),
    kCommandsServer: Symbol('"server" recieving payloads (called commands) to send to Discord')
  },
  kCluster: Symbol('Cluster instance')
} as const;

Object.freeze(GATEWAY_INJECTION_TOKENS);

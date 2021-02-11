import { readFileSync } from 'fs';
import { join } from 'path';
import { keyMirror } from './functions/keyMirror';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export const CORDIS_META: {
  url: string;
  version: string;
} = {
  url: pkg.homepage.split('#')[0],
  version: pkg.version
};

export const CORDIS_EVENTS = keyMirror([
  'channelCreate',
  'channelDelete',
  'channelPinsUpdate',
  'channelUpdate',
  'emojiCreate',
  'emojiDelete',
  'emojiUpdate',
  'guildIntegrationsUpdate',
  'guildBanAdd',
  'guildBanRemove',
  'guildCreate',
  'guildDelete',
  'guildUpdate',
  'guildMemberAdd',
  'guildMemberRemove',
  'guildMemberUpdate',
  'roleCreate',
  'roleDelete',
  'roleUpdate',
  'messageCreate',
  'bulkMessageDelete',
  'messageDelete',
  'messageUpdate',
  'messageReactionAdd',
  'messageReactionRemove',
  'messageReactionRemoveEmoji',
  'messageReactionRemoveAll',
  'inviteCreate',
  'inviteDelete',
  'presenceUpdate',
  'ready',
  'typingStart',
  'userUpdate',
  'voiceServerUpdate',
  'voiceStateUpdate',
  'webhooksUpdate',
  'botUserUpdate'
]);

// Anything beginning with cordis_internal is used & depended on internally; please do NOT mutate the data/publish anything to these.

export const CORDIS_REDIS_SYMBOLS = {
  internal: {
    amqp: {
      queues: (exchange: string) => `cordis_internal_amqp_${exchange}_queues`
    },
    gateway: {
      shardCount: 'cordis_internal_gateway_shard_count',
      clusters: {
        count: 'cordis_internal_gateway_clusters_count',
        currentlySpawning: 'cordis_internal_gateway_clusters_currently_spawning',
        shardCount: 'cordis_internal_gateway_clusters_shard_count'
      }
    }
  },
  cache: {
    guilds: 'guilds',
    users: 'users',
    presences: (guild: string) => `${guild}_presences`,
    channels: (guild?: string) => guild ? `${guild}_channels` : 'dm_channels',
    members: (guild: string) => `${guild}_members`,
    roles: (guild: string) => `${guild}_roles`,
    emojis: (guild: string) => `${guild}_emojis`,
    messages: (channel: string) => `${channel}_messages`,
    reactions: (message: string) => `${message}_reactions`
  }
};

export const CORDIS_AMQP_SYMBOLS = {
  gateway: {
    packets: 'gateway',
    commands: 'gateway_commands',
    events: keyMirror([
      'channelCreate',
      'channelDelete',
      'channelPinsUpdate',
      'channelUpdate',

      'emojiCreate',
      'emojiDelete',
      'emojiUpdate',

      'guildIntegrationsUpdate',
      'guildBanAdd',
      'guildBanRemove',
      'guildCreate',
      'guildAvailable',
      'guildDelete',
      'guildUnavailable',
      'guildUpdate',

      'guildMemberAdd',
      'guildMemberRemove',
      'guildMemberUpdate',

      'roleCreate',
      'roleDelete',
      'roleUpdate',

      'messageCreate',
      'bulkMessageDelete',
      'messageDelete',
      'messageUpdate',

      'messageReactionAdd',
      'messageReactionRemove',
      'messageReactionRemoveEmoji',
      'messageReactionRemoveAll',

      'inviteCreate',
      'inviteDelete',

      'presenceUpdate',
      'ready',
      'typingStart',
      'userUpdate',
      'voiceServerUpdate',
      'voiceStateUpdate',
      'webhooksUpdate',

      'botUserUpdate'
    ])
  },
  rest: {
    queue: 'rest_queue'
  }
};

export const ENDPOINTS = {
  api: 'https://discord.com/api',
  cdn: 'https://cdn.discordapp.com',
  invite: 'https://discord.gg'
};

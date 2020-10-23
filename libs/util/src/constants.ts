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

export const ENDPOINTS = {
  api: 'https://discord.com/api',
  cdn: 'https://cdn.discordapp.com',
  invite: 'https://discord.gg'
};

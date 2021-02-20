import { BitField, BitFieldResolvable } from '@cordis/bitfield';

/**
 * Intent flags
 */
export const INTENTS = BitField.makeFlags([
  'guilds',
  'guildMembers',
  'guildBans',
  'guildEmojis',
  'guildIntegrations',
  'guildWebhooks',
  'guildInvites',
  'guildVoiceStates',
  'guildPresences',
  'guildMessages',
  'guildMessageReactions',
  'guildMessageTyping',
  'directMessages',
  'directMessageReactions',
  'directMessageTyping',
  'all',
  'privileged',
  'nonPrivileged'
]);

INTENTS.privileged = INTENTS.guildMembers | INTENTS.guildPresences;
/** @internal */
const _values = Object.values(INTENTS);
INTENTS.all = _values.reduce((acc, p, index) => index < _values.length - 3 ? acc | p : acc, 0n);
INTENTS.nonPrivileged = INTENTS.all & ~INTENTS.privileged;

/**
 * Intent keys
 */
export type IntentKeys = keyof(typeof INTENTS);

/**
 * Class for representing intents
 */
export class Intents extends BitField<IntentKeys> {
  public constructor(bits: BitFieldResolvable<IntentKeys>) {
    super(INTENTS, bits);
  }
}

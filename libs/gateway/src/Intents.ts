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
  'directMessageTyping'
]);

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

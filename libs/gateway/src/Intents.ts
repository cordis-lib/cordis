import { BitField, BitFieldResolvable } from '@cordis/bitfield';

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
INTENTS.all = Object
  .values(INTENTS)
  .filter(v => v !== -1n)
  .reduce((acc, p) => acc | p, 0n);
INTENTS.nonPrivileged = INTENTS.all & ~INTENTS.privileged;

export type IntentKeys = keyof(typeof INTENTS);

export class Intents extends BitField<IntentKeys> {
  public constructor(bits: BitFieldResolvable<IntentKeys>) {
    super(INTENTS, bits);
  }
}

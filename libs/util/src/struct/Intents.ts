import { BitField, BitFieldResolvable } from './BitField';

export const INTENTS = {
  guilds: BitField.bigintify(0),
  guildMembers: BitField.bigintify(1),
  guildBans: BitField.bigintify(2),
  guildEmojis: BitField.bigintify(3),
  guildIntegrations: BitField.bigintify(4),
  guildWebhooks: BitField.bigintify(5),
  guildInvites: BitField.bigintify(6),
  guildVoiceStates: BitField.bigintify(7),
  guildPresences: BitField.bigintify(8),
  guildMessages: BitField.bigintify(9),
  guildMessageReactions: BitField.bigintify(10),
  guildMessageTyping: BitField.bigintify(11),
  directMessages: BitField.bigintify(12),
  directMessageReactions: BitField.bigintify(13),
  directMessageTyping: BitField.bigintify(14),
  privileged: -1n,
  all: -1n,
  nonPrivileged: -1n
};

INTENTS.privileged = INTENTS.guildMembers | INTENTS.guildPresences;
INTENTS.all = Object.values(INTENTS).reduce((acc, p) => acc | p, 0n);
INTENTS.nonPrivileged = INTENTS.all & ~INTENTS.privileged;

export type IntentKeys = keyof(typeof INTENTS);

export class Intents extends BitField<IntentKeys> {
  public constructor(bits: BitFieldResolvable<IntentKeys>) {
    super(INTENTS, bits);
  }
}

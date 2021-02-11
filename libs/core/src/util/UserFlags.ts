import { BitField, BitFieldResolvable } from '@cordis/common';

const USER_FLAGS = {
  discordEmployee: BitField.bigintify(0),
  partneredServerOwner: BitField.bigintify(1),
  hypesquadEvents: BitField.bigintify(2),
  bughunterLevelOne: BitField.bigintify(3),
  houseBravery: BitField.bigintify(6),
  houseBrilliance: BitField.bigintify(7),
  houseBalance: BitField.bigintify(8),
  earlySupporter: BitField.bigintify(9),
  teamUser: BitField.bigintify(10),
  system: BitField.bigintify(12),
  bugHunterLevelTwo: BitField.bigintify(14),
  verifiedBot: BitField.bigintify(16),
  earlyVerifiedBot: BitField.bigintify(17)
};

type UserFlagKeys = keyof(typeof USER_FLAGS);

class UserFlags extends BitField<UserFlagKeys> {
  public constructor(bits: BitFieldResolvable<UserFlagKeys>) {
    super(USER_FLAGS, bits);
  }
}

export {
  USER_FLAGS,
  UserFlagKeys,
  UserFlags
};

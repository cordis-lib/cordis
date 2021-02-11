import { BitField, BitFieldResolvable } from '@cordis/common';

const MESSAGE_FLAGS = {
  crossposted: BitField.bigintify(0),
  isCrosspost: BitField.bigintify(1),
  supressEmbeds: BitField.bigintify(2),
  sourceMessageDeleted: BitField.bigintify(3),
  urgent: BitField.bigintify(4)
};

type MessageFlagKeys = keyof(typeof MESSAGE_FLAGS);

class MessageFlags extends BitField<MessageFlagKeys> {
  public constructor(bits: BitFieldResolvable<MessageFlagKeys>) {
    super(MESSAGE_FLAGS, bits);
  }
}

export {
  MESSAGE_FLAGS,
  MessageFlagKeys,
  MessageFlags
};

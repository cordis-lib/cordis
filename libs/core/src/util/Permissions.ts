import { BitField, BitFieldResolvable } from '@cordis/common';

const PERMISSIONS = {
  createInstantInvite: BitField.bigintify(0),
  kickMembers: BitField.bigintify(1),
  banMembers: BitField.bigintify(2),
  administrator: BitField.bigintify(3),
  manageChannels: BitField.bigintify(4),
  manageGuild: BitField.bigintify(5),
  addReactions: BitField.bigintify(6),
  viewAuditLog: BitField.bigintify(7),
  prioritySpeaker: BitField.bigintify(8),
  stream: BitField.bigintify(9),
  viewChannel: BitField.bigintify(10),
  sendMessages: BitField.bigintify(11),
  sendTTSMessages: BitField.bigintify(12),
  manageMessages: BitField.bigintify(13),
  embedLinks: BitField.bigintify(14),
  attachFiles: BitField.bigintify(15),
  readMessageHistory: BitField.bigintify(16),
  mentionEveryone: BitField.bigintify(17),
  useExternalEmojis: BitField.bigintify(18),
  viewGuildInsights: BitField.bigintify(19),
  connect: BitField.bigintify(20),
  speak: BitField.bigintify(21),
  muteMembers: BitField.bigintify(22),
  deafenMembers: BitField.bigintify(23),
  moveMembers: BitField.bigintify(24),
  useVAD: BitField.bigintify(25),
  changeNickname: BitField.bigintify(26),
  manageNicknames: BitField.bigintify(27),
  manageRoles: BitField.bigintify(28),
  manageWebhooks: BitField.bigintify(29),
  manageEmojis: BitField.bigintify(30),
  all: -1n
};

PERMISSIONS.all = Object
  .values(PERMISSIONS)
  .filter(v => v !== -1n)
  .reduce((acc, p) => acc | p, 0n);

type PermissionKey = keyof(typeof PERMISSIONS);

class Permissions extends BitField<PermissionKey> {
  public constructor(bits: BitFieldResolvable<PermissionKey>) {
    super(PERMISSIONS, bits);
  }

  public any(permission: BitFieldResolvable<PermissionKey>, checkAdmin = true) {
    return (checkAdmin && super.has(PERMISSIONS.administrator)) || super.any(permission);
  }

  public has(permission: BitFieldResolvable<PermissionKey>, checkAdmin = true) {
    return (checkAdmin && super.has(PERMISSIONS.administrator)) || super.has(permission);
  }
}

export {
  PERMISSIONS,
  PermissionKey,
  Permissions
};

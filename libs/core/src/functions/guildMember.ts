import { PatchedAPIGuildMember, Patcher, Snowflake } from '@cordis/util';
import type { APIUser } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';
import type { GuildMember, User } from '../types';

const isAPIGuildMember = (guildMember: any): guildMember is PatchedAPIGuildMember => 'nick' in guildMember &&
'roles' in guildMember &&
'deaf' in guildMember &&
'mute' in guildMember;

const isGuildMember = (guildMember: any): guildMember is GuildMember => 'user' in guildMember &&
'roles' in guildMember &&
guildMember.roles instanceof Map &&
guildMember.toString() === `<@${guildMember.user.id}>`;

const sanitizeGuildMember = (
  raw: (Omit<PatchedAPIGuildMember, 'user'> & { user: APIUser | User }) | GuildMember,
  { functions: { retrieveFunction } }: FactoryMeta
): GuildMember => {
  if (retrieveFunction('isGuildMember')(raw)) return raw;

  const {
    user,
    /* eslint-disable @typescript-eslint/naming-convention */
    joined_at,
    premium_since,
    /* eslint-enable @typescript-eslint/naming-convention */
    pending = false,
    ...member
  } = raw;

  const joinedAt = new Date(joined_at);
  const premiumAt = premium_since ? new Date(premium_since) : null;

  return {
    ...member,
    ...Snowflake.getCreationData(user.id),
    get id() {
      return this.user.id;
    },
    user: retrieveFunction('isUser')(user) ? user : retrieveFunction('sanitizeUser')(Patcher.patchUser(user).data),
    joinedAt,
    joinedTimestamp: joinedAt.getTime(),
    premiumAt,
    premiumTimestamp: premiumAt?.getTime() ?? null,
    pending
  };
};

export {
  isAPIGuildMember,
  isGuildMember,
  sanitizeGuildMember
};

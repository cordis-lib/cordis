import { ENDPOINTS, PatchedAPIInvite, Patcher } from '@cordis/util';
import { rawData } from '../util/Symbols';
import { UserFlags } from '../util/UserFlags';
import type { APIInvite } from 'discord-api-types';
import type { FactoryMeta } from '../FunctionManager';
import type { Invite } from '../Types';

const isAPIInvite = (invite: any): invite is APIInvite => 'code' in invite && 'url' in invite && 'inviter' in invite;

const isInvite = (invite: any): invite is Invite => 'code' in invite &&
  'url' in invite &&
  'inviter' in invite &&
  invite.url === `${ENDPOINTS.invite}/${invite.code}` &&
  invite.inviter.flags instanceof UserFlags && invite.inviter.toString() === `<@${invite.inviter.id}>`;

// TODO: Channel
const sanitizeInvite = (raw: PatchedAPIInvite | Invite, { functions: { retrieveFunction } }: FactoryMeta): Invite => {
  if (retrieveFunction('isInvite')(raw)) return raw;

  const {
    inviter,
    guild = null,
    /* eslint-disable @typescript-eslint/naming-convention */
    approximate_member_count,
    approximate_presence_count,
    target_user,
    target_user_type,
    /* eslint-enable @typescript-eslint/naming-convention */
    ...invite
  } = raw;

  return {
    ...invite,
    guild: guild ? retrieveFunction('sanitizeGuild')(guild) : null,
    memberCount: approximate_member_count ?? null,
    presenceCount: approximate_presence_count ?? null,
    inviter: retrieveFunction('sanitizeUser')(Patcher.patchUser(inviter!).data),
    target: target_user ? retrieveFunction('sanitizeUser')(Patcher.patchUser(target_user).data) : null,
    targetType: target_user_type ?? null,
    get url() {
      return `${ENDPOINTS.invite}/${this.code}`;
    },
    toString() {
      return this.url;
    },
    [rawData]: raw
  };
};

export {
  isAPIInvite,
  isInvite,
  sanitizeInvite
};

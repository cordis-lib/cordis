import { ENDPOINTS, PatchedAPIInvite, Patcher } from '@cordis/util';
import { APIInvite } from 'discord-api-types';
import { FactoryMeta } from '../FunctionManager';
import { Invite, InviteResolvable } from '../Types';
import { rawData } from '../util/Symbols';
import { UserFlags } from '../util/UserFlags';

const isAPIInvite = (invite: any): invite is APIInvite => 'code' in invite && 'url' in invite && 'inviter' in invite;

const isInvite = (invite: any): invite is Invite => 'code' in invite &&
  'url' in invite &&
  'inviter' in invite &&
  invite.url === `${ENDPOINTS.invite}/${invite.code}` &&
  invite.inviter.flags instanceof UserFlags && invite.inviter.toString() === `<@${invite.inviter.id}>`;

// TODO: Guild, Channel
const sanatizeInvite = (raw: PatchedAPIInvite, { functions: { retrieveFunction } }: FactoryMeta): Invite => {
  const {
    /* eslint-disable @typescript-eslint/naming-convention */
    inviter,
    approximate_member_count,
    approximate_presence_count,
    target_user,
    target_user_type,
    /* eslint-enable @typescript-eslint/naming-convention */
    ...invite
  } = raw;

  return {
    ...invite,
    memberCount: approximate_member_count ?? null,
    presenceCount: approximate_presence_count ?? null,
    inviter: retrieveFunction('sanatizeUser')(Patcher.patchUser(inviter!).data),
    target: target_user ? retrieveFunction('sanatizeUser')(Patcher.patchUser(target_user).data) : null,
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

const resolveInvite = (invite: InviteResolvable, { functions: { retrieveFunction } }: FactoryMeta): Invite | null => {
  if (retrieveFunction('isInvite')(invite)) return invite;
  if (retrieveFunction('isAPIInvite')(invite)) return retrieveFunction('sanatizeInvite')(invite);
  return null;
};

const resolveInviteUrl = (invite: InviteResolvable | string, { functions: { retrieveFunction } }: FactoryMeta): string | null => {
  if (typeof invite === 'string') return `${ENDPOINTS.invite}/${invite.replace(/(https\:\/\/)?(discord)?(\.gg)?\/?/g, '')}`;
  return retrieveFunction('resolveInvite')(invite)?.code ?? null;
};

export {
  isAPIInvite,
  isInvite,
  sanatizeInvite,
  resolveInvite,
  resolveInviteUrl
};

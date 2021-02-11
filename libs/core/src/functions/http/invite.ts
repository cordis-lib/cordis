import { RESTDeleteAPIInviteResult, RESTGetAPIInviteResult, Routes } from 'discord-api-types';
import { Patcher } from '@cordis/common';
import { CordisCoreError } from '../../util/Error';
import type { FactoryMeta } from '../../FunctionManager';
import type { InviteResolvable } from '../../types';

const getInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  if (!code) throw new CordisCoreError('entityUnresolved', 'invite code');

  return rest
    .get<RESTGetAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanitizeInvite')({
        ...data,
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};

const deleteInvite = (invite: InviteResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  const code = retrieveFunction('resolveInviteCode')(invite);

  if (!code) throw new CordisCoreError('entityUnresolved', 'invite code');

  return rest
    .delete<RESTDeleteAPIInviteResult>(Routes.invite(code))
    .then(
      data => retrieveFunction('sanitizeInvite')({
        ...data,
        guild: data.guild ? Patcher.patchGuild(data.guild).data : undefined,
        channel: Patcher.patchChannel(data.channel!).data
      })
    );
};

export {
  getInvite,
  deleteInvite
};

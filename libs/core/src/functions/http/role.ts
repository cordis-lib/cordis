import { Routes, RESTGetAPIGuildRolesResult } from 'discord-api-types';
import { Patcher } from '@cordis/common';
import { CordisCoreError } from '../../util/Error';
import type { GuildResolvable } from '../../types';
import type { FactoryMeta } from '../../FunctionManager';

const getRoles = (guild: GuildResolvable | string, { functions: { retrieveFunction }, rest }: FactoryMeta) => {
  if (typeof guild !== 'string') {
    const resolved = retrieveFunction('resolveGuildId')(guild);
    if (!resolved) throw new CordisCoreError('entityUnresolved', 'guild id');
    guild = resolved;
  }

  return rest
    .get<RESTGetAPIGuildRolesResult>(Routes.guildRoles(guild))
    .then(
      roles => roles.map(
        role => retrieveFunction('sanitizeRole')(
          Patcher.patchRole(role).data
        )
      )
    );
};

export {
  getRoles
};

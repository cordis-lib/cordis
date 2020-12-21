import { PatchedAPIRole, Snowflake } from '@cordis/util';
import { rawData } from '../util/Symbols';
import type { FactoryMeta } from '../FunctionManager';
import type { Role } from '../types';
import { Permissions } from '../util/Permissions';

const isAPIRole = (role: any): role is PatchedAPIRole => 'tags' in role && role.tags.premium_subscriber == null;

const isRole = (role: any): role is Role => 'id' in role &&
  role.toString() === `<@&${role.id}>` &&
  'tags' in role &&
  typeof role.tags.premiumSubscriber === 'boolean';

const sanitizeRole = (raw: PatchedAPIRole | Role, { functions: { retrieveFunction } }: FactoryMeta): Role => {
  if (retrieveFunction('isRole')(raw)) return raw;

  const {
    tags,
    permissions,
    ...role
  } = raw;

  return {
    ...role,
    ...Snowflake.getCreationData(role.id),
    permissions: new Permissions(BigInt(permissions)),
    tags: {
      botId: tags?.bot_id ?? null,
      integrationId: tags?.integration_id ?? null,
      premiumSubscriber: tags?.premium_subscriber == null
    },
    toString() {
      return `<@&${this.id}>`;
    },
    [rawData]: raw
  };
};

export {
  isAPIRole,
  isRole,
  sanitizeRole
};

import { PatchedAPIRole, Snowflake } from '@cordis/util';
import { FactoryMeta } from '../FunctionManager';
import { Role, RoleResolvable } from '../Types';
import { rawData } from '../util/Symbols';

const isAPIRole = (role: any): role is PatchedAPIRole => 'tags' in role && role.tags.premium_subscriber == null;

const isRole = (role: any): role is Role => 'id' in role &&
  role.toString() === `<@&${role.id}>` &&
  'tags' in role &&
  typeof role.tags.premiumSubscriber === 'boolean';

const sanitizeRole = (raw: PatchedAPIRole | Role, { functions: { retrieveFunction } }: FactoryMeta): Role => {
  if (retrieveFunction('isRole')(raw)) return raw;

  const {
    tags,
    ...role
  } = raw;

  return {
    ...role,
    ...Snowflake.getCreationData(role.id),
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

const resolveRole = (role: RoleResolvable, { functions: { retrieveFunction } }: FactoryMeta): Role | null => {
  if (retrieveFunction('isRole')(role)) return role;
  if (retrieveFunction('isAPIRole')(role)) return retrieveFunction('sanitizeRole')(role);
  return null;
};

const resolveRoleId = (role: RoleResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveRole')(role)?.id ?? null;

export {
  isAPIRole,
  isRole,
  sanitizeRole,
  resolveRole,
  resolveRoleId
};

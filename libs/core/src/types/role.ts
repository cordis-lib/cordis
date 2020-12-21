import type { PatchedAPIRole, SnowflakeEntity } from '@cordis/util';
import type { Permissions } from '../util/Permissions';
import type { rawData } from '../util/Symbols';

interface RoleTags {
  botId: string | null;
  premiumSubscriber: boolean;
  integrationId: string | null;
}

interface Role extends Omit<PatchedAPIRole, 'tags' | 'permissions'>, SnowflakeEntity {
  tags: RoleTags;
  permissions: Permissions;
  toString(): string;
  [rawData]: PatchedAPIRole;
}

export {
  RoleTags,
  Role
};

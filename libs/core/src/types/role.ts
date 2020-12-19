import type { PatchedAPIRole, SnowflakeEntity } from '@cordis/util';
import type { rawData } from '../util/Symbols';

interface RoleTags {
  botId: string | null;
  premiumSubscriber: boolean;
  integrationId: string | null;
}

interface Role extends Omit<PatchedAPIRole, 'tags'>, SnowflakeEntity {
  tags: RoleTags;
  toString(): string;
  [rawData]: PatchedAPIRole;
}

export {
  RoleTags,
  Role
};

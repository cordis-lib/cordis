import type { PatchedAPIGuildMember, SnowflakeEntity } from '@cordis/util';
import type { Role } from './role';
import type { User } from './user';

interface GuildMember extends SnowflakeEntity, Omit<PatchedAPIGuildMember, 'user' | 'joined_at' | 'premium_since' | 'pending' | 'roles'> {
  readonly id: string;
  user: User;
  nick: string | null;
  roles: Map<string, Role>;
  joinedTimestamp: number;
  joinedAt: Date;
  premiumTimestamp: number | null;
  premiumAt: Date | null;
  pending: boolean;
}

export {
  GuildMember
};

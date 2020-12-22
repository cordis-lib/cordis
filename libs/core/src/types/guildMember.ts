import type { PatchedAPIGuildMember, SnowflakeEntity } from '@cordis/util';
import type { User } from './user';

interface GuildMember extends SnowflakeEntity, Omit<PatchedAPIGuildMember, 'user' | 'joined_at' | 'premium_since' | 'pending'> {
  readonly id: string;
  user: User;
  nick: string | null;
  joinedTimestamp: number;
  joinedAt: Date;
  premiumTimestamp: number | null;
  premiumAt: Date | null;
  pending: boolean;
  toString(): string;
}

export {
  GuildMember
};

import { Redis } from 'ioredis';
import { Mutex } from './Mutex';
import type { RatelimitData } from '../Bucket';

export class RedisMutex extends Mutex {
  private readonly _keys = {
    remaining: (route: string) => `${route}:remaining`,
    limit: (route: string) => `${route}:limit`
  };

  public constructor(
    public readonly redis: Redis
  ) {
    super();
  }

  protected async _getTimeout(route: string) {
    const global = await this.redis.pttl('global');
    if (global > 0) return global;

    const rawLimit = await this.redis.get(this._keys.limit(route));
    const limit = rawLimit ? parseInt(rawLimit) : 1;

    if (limit <= 0) return 0;

    const rawRemaining = await this.redis.get(this._keys.remaining(route));
    if (!rawRemaining) {
      await this.redis.set(this._keys.remaining(route), limit - 1);
      return 0;
    }

    const remaining = parseInt(rawRemaining);

    const ttl = await this.redis.pttl(this._keys.remaining(route));
    if (remaining <= 0) {
      if (ttl <= 0) return 1e2;
      return ttl;
    }

    await this.redis.set(this._keys.remaining(route), remaining - 1);
    if (ttl > 0) await this.redis.pexpire(this._keys.remaining(route), ttl);

    return 0;
  }

  public async set(route: string, limits: Partial<RatelimitData>) {
    const pipe = this.redis.pipeline();

    if (limits.timeout) {
      if (limits.global) pipe.set('global', 'true', 'px', limits.timeout);
      else pipe.pexpire(this._keys.remaining(route), limits.timeout);
    }

    pipe
      .set(this._keys.limit(route), limits.limit ?? 0)
      .set(this._keys.remaining(route), limits.remaining ?? 0, 'nx');

    await pipe.exec();
  }
}

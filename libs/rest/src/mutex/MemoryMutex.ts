// ? Anything ignored from coverage in this file are just weird edge cases - nothing to really cover.

import { Mutex } from './Mutex';
import type { RatelimitData } from '../struct';

export interface MemoryRatelimitData extends RatelimitData {
  expiresAt: Date;
}

/**
 * In-memory implementation of the Mutex for keeping the rate limit state in-memory
 */
export class MemoryMutex extends Mutex {
  /**
   * Map containing the current limits for each route
   */
  private readonly _limits: Map<string, Partial<MemoryRatelimitData>> = new Map();

  /**
   * Time at which the global rate limit is going to expire, if one is active
   */
  public global: Date | null = null;

  protected _getTimeout(route: string) {
    const globalExpiration = this.global?.getTime() ?? 0;
    /* istanbul ignore if */
    if (globalExpiration > Date.now()) {
      return globalExpiration - Date.now();
    }

    const ratelimit = this._limits.get(route);

    /* istanbul ignore if */
    if (!ratelimit) {
      this._limits.set(route, {});
      return 0;
    }

    if (ratelimit.remaining == null || ratelimit.remaining <= 0) {
      /* istanbul ignore else */
      if (ratelimit.expiresAt) {
        return Math.max(ratelimit.expiresAt.getTime() - Date.now(), 0);
      }

      /* istanbul ignore next */
      return 1e2;
    }

    ratelimit.remaining--;
    return 0;
  }

  public set(route: string, newLimits: Partial<RatelimitData>) {
    let limit = this._limits.get(route);
    /* istanbul ignore else */
    if (!limit) {
      limit = {};
      this._limits.set(route, limit);
    }

    if (newLimits.timeout != null) {
      const expiresAt = new Date(Date.now() + newLimits.timeout);
      /* istanbul ignore if */
      if (newLimits.global) {
        this.global = expiresAt;
      } else {
        limit.expiresAt = expiresAt;
      }
    }

    limit.limit = newLimits.limit ?? 0;
    /* istanbul ignore next */
    if (limit.remaining == null || limit.remaining === Infinity) {
      limit.remaining = newLimits.remaining ?? newLimits.limit ?? Infinity;
    }
  }
}

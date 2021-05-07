import { halt } from '@cordis/common';
import { CordisRestError } from '../Error';
import type { RatelimitData } from '../struct';

/**
 * "Mutex" used to ensure requests don't go through when a ratelimit is about to happen
 */
export abstract class Mutex {
  /**
   * "Claims" a route
   * @param route Route to claim
   * @param wait Wether or not the function should wait for the limit or if it should simply throw
   * @returns A promise that resolves once it is safe to go through with the request - its value being the timeout
   */
  public async claim(route: string, wait = true) {
    let timeout = await this._getTimeout(route);
    let output = timeout;

    if (timeout > 0) {
      if (!wait) return Promise.reject(new CordisRestError('mutexLock', route));

      while (timeout > 0) {
        await halt(timeout);
        timeout = await this._getTimeout(route);
        output += timeout;
      }
    }

    return output;
  }

  /**
   * Calculates and returns the current timeout for the given route
   */
  protected abstract _getTimeout(route: string): number | Promise<number>;

  /**
   * Updates the ratelimit data for the given route
   */
  public abstract set(route: string, limits: Partial<RatelimitData>): void | Promise<void>;
}

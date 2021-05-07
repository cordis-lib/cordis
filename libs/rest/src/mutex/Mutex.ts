import { halt } from '@cordis/common';
import type { RatelimitData } from '../struct';

/**
 * "Mutex" used to ensure requests don't go through when a ratelimit is about to happen
 */
export abstract class Mutex {
  /**
   * "Claims" a route
   * @param route Route to claim
   * @returns A promise that resolves once it is safe to go through with the request - its value being the timeout
   */
  public async claim(route: string) {
    let timeout = await this._getTimeout(route);
    let output = timeout;

    while (timeout > 0) {
      await halt(timeout);
      timeout = await this._getTimeout(route);
      output += timeout;
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

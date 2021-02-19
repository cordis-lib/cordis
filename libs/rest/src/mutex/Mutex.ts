import { CordisRestError } from '../Error';
import { halt } from '@cordis/common';
import type { AbortSignal } from 'abort-controller';
import type { RatelimitData } from '../Bucket';

/**
 * "Mutex" used to ensure requests don't go through when a ratelimit is about to happen
 */
export abstract class Mutex {
  /**
   * "Claims" a route
   * @param route Route to claim
   * @param signal Abort signal
   * @returns A promise that resolves once it is safe to go through with the request
   */
  public claim(route: string, signal?: AbortSignal | null) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise<void>(async (resolve, reject) => {
      const listener = () => reject(new CordisRestError('requestTimeout'));
      if (signal) signal.addEventListener('abort', listener, { once: true });

      try {
        let timeout = await this._getTimeout(route);
        while (timeout > 0 && !signal?.aborted) {
          await halt(timeout);
          timeout = await this._getTimeout(route);
        }
      } catch (e) {
        /* istanbul ignore next */
        return reject(e);
      }

      if (signal) signal.removeEventListener('abort', listener);
      resolve();
    });
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

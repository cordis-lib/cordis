import { CordisRestError } from '../Error';
import { halt } from '@cordis/common';
import type { AbortSignal } from 'abort-controller';
import type { RatelimitData } from '../Bucket';

export abstract class Mutex {
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

  protected abstract _getTimeout(route: string): number | Promise<number>;

  public abstract set(route: string, limits: Partial<RatelimitData>): void | Promise<void>;
}

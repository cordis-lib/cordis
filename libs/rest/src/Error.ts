import makeCordisError from '@cordis/error';
import type { Response } from 'node-fetch';

/** @internal */
export const CordisRestError = makeCordisError(
  Error,
  {
    retryLimitExceeded: (request: string, attempts: number) => `Tried to "${request}" for ${attempts} times but all of them failed`,
    mutexLock: (route: string) => `A mutex for the "${route}" bucket locked up but was told to not wait`,
    rateLimited: (request: string) => `A ratelimit was hit/prevented while "${request}"`
  }
);

/**
 * Error thrown by Discord the library cannot handle
 */
export class HTTPError extends Error {
  public constructor(public readonly response: Response, body: string) {
    super(`${response.statusText}: ${body}`);
  }
}

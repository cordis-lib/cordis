import makeCordisError from '@cordis/error';
import type { Response } from 'node-fetch';

/** @internal */
export const CordisRestError = makeCordisError(
  Error,
  {
    retryLimitExceeded: (attempts: number) => `Tried to make request ${attempts} times but all of them failed`,
    rateLimited: 'A ratelimit was hit',
    internal: 'Discord raised an internal error'
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

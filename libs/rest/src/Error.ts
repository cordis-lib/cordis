import makeCordisError from '@cordis/error';
import type { Response } from 'node-fetch';

/** @internal */
export const CordisRestError = makeCordisError(
  Error,
  {
    retryLimitExceeded: (request: string, attempts: number) => `Tried to "${request}" for ${attempts} times but all of them failed.`,
    requestTimeout: (request: string) => `Request "${request}" timed out.`
  }
);

/**
 * Error thrown by Discord the library cannot handle
 */
export class HTTPError extends Error {
  public constructor(public readonly response: Response, body: string) {
    super(`${response.statusText}: ${body}`);

    Error.captureStackTrace(this);
  }
}

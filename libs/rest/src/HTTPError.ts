import { Response } from 'node-fetch';

export const MESSAGES = {
  retryLimitExceeded: (request: string, attempts: number) => `Tried to "${request}" for ${attempts} times but all of them failed.`
};

export class HTTPError extends Error {
  public constructor(public readonly response: Response, body: string) {
    super(`${response.statusText}: ${body}`);

    Error.captureStackTrace(this);
  }
}

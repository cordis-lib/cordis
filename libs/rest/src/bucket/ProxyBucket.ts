import { discordFetch, DiscordFetchOptions } from './Fetch';
import { CordisRestError, HTTPError } from '../Error';
import { BaseBucket } from './BaseBucket';
import type { Response } from 'node-fetch';

/**
 * Unconventional Bucket implementation that will hijack all requests (i.e. there is no seperate bucket depending on the route)
 *
 * This is meant for proxying requests, but will not handle any ratelimiting and will entirely ignore mutexes
 */
export class ProxyBucket extends BaseBucket {
  public static override makeRoute() {
    return 'proxy';
  }

  public async make<D, Q>(req: DiscordFetchOptions<D, Q>): Promise<Response> {
    let timeout: NodeJS.Timeout;
    if (req.implicitAbortBehavior) {
      timeout = setTimeout(() => req.controller.abort(), this.rest.abortAfter);
    }

    const res = await discordFetch(req).finally(() => clearTimeout(timeout));

    if (res.status === 429) {
      return Promise.reject(new CordisRestError('rateLimited', `${req.method.toUpperCase()} ${req.path}`));
    } else if (!res.ok) {
      return Promise.reject(new HTTPError(res.clone(), await res.text()));
    }

    return res;
  }
}

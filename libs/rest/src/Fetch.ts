import fetch, { Headers } from 'node-fetch';
import FormData from 'form-data';
import { URLSearchParams } from 'url';
import { ENDPOINTS } from '@cordis/common';
import AbortController from 'abort-controller';

export type AnyRecord = Record<any, any>;

/**
 * Presents the base options that may be needed for making a request to Discord
 */
export interface DiscordFetchOptions<D extends AnyRecord = AnyRecord, Q extends AnyRecord = AnyRecord> {
  path: string;
  method: string;
  headers: Headers;
  controller: AbortController;
  query?: Q | string;
  files?: { name: string; file: Buffer }[];
  data?: D;
  failures?: number;
}

/**
 * Makes the actual HTTP request
 * @param options Options for the request
 */
export const discordFetch = <D, Q>(options: DiscordFetchOptions<D, Q>) => {
  let { path, method, headers, controller, query, files, data } = options;

  let queryString: string | null = null;
  if (query) {
    queryString = new URLSearchParams(
      typeof query === 'string'
        ? query
        : Object
          .entries(query)
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          .filter(([, value]) => value != null)
    ).toString();
  }

  const url = `${ENDPOINTS.api}/v8/${path}${queryString ? `?${queryString}` : ''}`;

  let body: string | FormData;
  if (files?.length) {
    body = new FormData();
    for (const file of files) body.append(file.name, file.file, file.name);
    if (data != null) body.append('payload_json', JSON.stringify(data));
    headers = Object.assign(headers, body.getHeaders());
  } else if (data != null) {
    body = JSON.stringify(data);
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    method: method,
    headers,
    body: body!,
    signal: controller.signal
  });
};

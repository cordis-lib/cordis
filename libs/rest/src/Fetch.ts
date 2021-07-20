import fetch, { Headers } from 'node-fetch';
import FormData from 'form-data';
import { URLSearchParams } from 'url';
import AbortController from 'abort-controller';
import { RouteBases } from 'discord-api-types/v9';

/**
 * Represents a file that can be sent to Discord
 */
export interface File {
  /**
   * Name of the file
   */
  name: string;
  /**
   * Contents of the file
   */
  content: Buffer;
}

export type StringRecord = Record<string, string>;

export interface RequestBodyData {
  [key: string]: string | number | boolean | RequestBodyData;
}

/**
 * Presents the base options that may be needed for making a request to Discord
 */
export interface DiscordFetchOptions<D = RequestBodyData, Q = StringRecord> {
  path: string;
  method: string;
  headers: Headers;
  controller: AbortController;
  implicitAbortBehavior: boolean;
  retryAfterRatelimit: boolean;
  isRetryAfterRatelimit: boolean;
  query?: Q | string;
  files?: File[];
  data?: D;
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

  const url = `${RouteBases.api}${path}${queryString ? `?${queryString}` : ''}`;

  let body: string | FormData;
  if (files?.length) {
    body = new FormData();
    for (const file of files) {
      body.append(file.name, file.content, file.name);
    }

    if (data != null) {
      body.append('payload_json', JSON.stringify(data));
    }

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

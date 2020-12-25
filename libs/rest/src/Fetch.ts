import fetch, { Headers } from 'node-fetch';
import AbortController from 'abort-controller';
import FormData = require('form-data');
import { URLSearchParams } from 'url';

/**
 * Presents the base options that may be needed for making a request to Discord
 */
export interface RequestBuilderOptions<D = Record<any, any>, Q = Record<any, any>> {
  api: string;
  path: string;
  method: string;
  headers: Headers;
  abortIn: number;
  query?: Q | string;
  reason?: string;
  files?: { name: string; file: Buffer }[];
  data?: D;
  failures?: number;
}

/**
 * Makes a request, doing a lot of special things to satisfy Discord's requirements
 * @param options Options for the request
 */
export function discordFetch(options: RequestBuilderOptions) {
  let { api, path, method, query, reason, headers, files, data, abortIn } = options;

  let queryString = '';
  if (query) {
    queryString = new URLSearchParams(
      typeof query === 'string'
        ? query
        : Object
          .entries(query)
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          .filter(([, value]) => value != null)
    )
      .toString();
  }

  path = `${path}${queryString && `?${queryString}`}`;
  const url = `${api}${path}`;

  if (reason) headers.set('X-Audit-Log-Reason', encodeURIComponent(reason));

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), abortIn);

  return fetch(url, {
    method: method,
    headers,
    body: body!,
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
}

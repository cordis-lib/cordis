import fetch, { Response, Headers } from 'node-fetch';
import { Bucket } from '../fetcher';
import { CordisRestError, HTTPError } from '../Error';
import { RequestOptions, Rest } from './Rest';
import AbortController, { AbortSignal } from 'abort-controller';

jest.mock('node-fetch', () => {
  const fetch: typeof import('node-fetch') = jest.requireActual('node-fetch');

  const newFetch: any = jest.fn().mockImplementation(fetch.default);
  newFetch.Request = fetch.Request;
  newFetch.Response = fetch.Response;
  newFetch.Headers = fetch.Headers;

  return newFetch;
});

jest.mock('@cordis/common', () => {
  const start = Date.now();
  const now = jest.spyOn(Date, 'now').mockReturnValue(start);

  return {
    ...jest.requireActual('@cordis/common'),
    halt: jest
      .fn<Promise<void>, [number]>()
      .mockImplementation(timeout => {
        now.mockReturnValue(Date.now() + timeout);
        return Promise.resolve();
      })
  };
});

const mockedFetch = fetch as any as jest.Mock<Promise<Response>>;

let rest: Rest;

beforeEach(() => {
  rest = new Rest('token');
});

describe('buckets and rate limiting', () => {
  test('create bucket identifiers', () => {
    const general = Bucket.makeRoute('get', '/channels/12345678910111213');
    expect(general).toBe('/channels/:id');

    const messages = Bucket.makeRoute('get', '/channels/12345678910111213/messages');
    expect(messages).toBe('/channels/12345678910111213/messages');

    const first = Bucket.makeRoute('delete', '/channels/12345678910111213/messages/12345678910111213');
    expect(first).toBe('delete/channels/12345678910111213/messages/:id');

    const invite = Bucket.makeRoute('get', '/invites/abcdefgh');
    expect(invite).toBe('/invites/:code');
  });

  describe('make request', () => {
    test('ok request', async () => {
      const value = '{"foo":"bar"}';
      const res = new Response(Buffer.from(value), {
        headers: {
          'Content-Type': 'application/json',
          'X-Ratelimit-Limit': '5',
          'X-Ratelimit-Reset-After': '2.5'
        },
      }).clone();

      mockedFetch.mockResolvedValue(res.clone());

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data = await rest.make(req);

      expect(req.headers).toBeInstanceOf(Headers);
      expect(await data.json()).toStrictEqual(JSON.parse(value));
      expect(emitter).toBeCalledTimes(2);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
        implicitAbortBehavior: true,
        isRetryAfterRatelimit: false
      }));
      expect(emitter).toHaveBeenLastCalledWith('response', req, res, { limit: 5, timeout: 2500 });
    });

    test('429 response', async () => {
      const value = '{"foo":"bar"}';

      const responses = [
        new Response(value, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ratelimit-Global': 'false',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Remaining': '0',
            'X-Ratelimit-Reset-After': '2.5',
            'Retry-After': '2.5'
          },
          status: 429,
        }),
        new Response(value, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Reset-After': '2.5'
          },
          status: 200,
        })
      ].map(res => res.clone());

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++].clone()));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data = await rest.make(req);

      expect(emitter).toBeCalledTimes(5);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
        implicitAbortBehavior: true,
        isRetryAfterRatelimit: false
      }));
      expect(emitter).toHaveBeenNthCalledWith(2, 'response', req, responses[0], { global: false, limit: 5, remaining: 0, timeout: 2500 });
      expect(emitter).toHaveBeenNthCalledWith(3, 'ratelimit', 'channels/12345678910111213', 'channels/12345678910111213', false, 2500);
      expect(emitter).toHaveBeenNthCalledWith(4, 'request', Object.assign(req, { isRetryAfterRatelimit: true }));
      expect(emitter).toHaveBeenNthCalledWith(5, 'response', req, responses[1], { limit: 5, timeout: 2500 });

      expect(await data.json()).toStrictEqual(JSON.parse(value));
    });
  });
});

describe('non 429 error recovery', () => {
  describe('internal server error', () => {
    test('without exceeding retry limit', async () => {
      const value = '{"foo":"bar"}';

      const responses = [
        new Response(value, {
          headers: {
            'Content-Type': 'application/json'
          },
          status: 500,
        }),
        new Response(value, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Reset-After': '2.5'
          },
          status: 200,
        })
      ].map(res => res.clone());

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++].clone()));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data = await rest.make(req);

      expect(await data.json()).toStrictEqual(JSON.parse(value));
      expect(emitter).toBeCalledTimes(4);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
        implicitAbortBehavior: true,
        isRetryAfterRatelimit: false
      }));
      expect(emitter).toHaveBeenNthCalledWith(2, 'response', req, responses[0], {});
      expect(emitter).toHaveBeenNthCalledWith(3, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(4, 'response', req, responses[1], { limit: 5, timeout: 2500 });
    });

    test('exceeding the retry limit', async () => {
      const value = '{"foo":"bar"}';
      const http500 = new Response(value, {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 500,
      });

      const responses = [
        http500,
        http500,
        http500,
        http500,
        new Response(value, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Reset-After': '2.5'
          },
          status: 200,
        })
      ].map(res => res.clone());

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++].clone()));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      await expect(() => rest.make(req))
        .rejects
        .toThrow(CordisRestError);

      expect(emitter).toBeCalledTimes(8);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
        implicitAbortBehavior: true,
        isRetryAfterRatelimit: false
      }));
      expect(emitter).toHaveBeenNthCalledWith(2, 'response', req, responses[0], {});
      expect(emitter).toHaveBeenNthCalledWith(3, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(4, 'response', req, responses[1], {});
      expect(emitter).toHaveBeenNthCalledWith(5, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(6, 'response', req, responses[2], {});
      expect(emitter).toHaveBeenNthCalledWith(7, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(8, 'response', req, responses[3], {});
    });
  });

  test('general error recovery', async () => {
    const value = '{"foo":"bar"}';
    const responses = [
      new Response(value, {
        headers: {
          'Content-Type': 'application/json',
          'X-Ratelimit-Limit': '5',
          'X-Ratelimit-Reset-After': '2.5'
        },
        status: 403
      }).clone()
    ];

    let calls = 0;
    mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++].clone()));

    const emitter = jest.spyOn(rest, 'emit');
    const req: RequestOptions<{ test: string }, never> = {
      path: 'channels/12345678910111213',
      method: 'get',
      data: { test: '' }
    };

    await expect(() => rest.make(req))
      .rejects
      .toThrow(HTTPError);

    expect(emitter).toBeCalledTimes(2);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
      implicitAbortBehavior: true,
      isRetryAfterRatelimit: false
    }));
    expect(emitter).toHaveBeenNthCalledWith(2, 'response', req, responses[0], { limit: 5, timeout: 2500 });
  });

  test('timeout', async () => {
    const emitter = jest.spyOn(rest, 'emit');
    const req: RequestOptions<{ test: string }, never> = {
      path: 'channels/12345678910111213',
      method: 'get',
      data: { test: '' },
      controller: new AbortController()
    };

    const err = { name: 'AbortError', message: 'User aborted a request' };

    mockedFetch.mockImplementation(
      (_: string, { signal }: { signal: AbortSignal }) => new Promise(
        (_, reject) => signal.addEventListener('abort', () => reject(err), { once: true })
      )
    );

    await expect(() => {
      const promise = rest.make(req);
      setImmediate(() => req.controller!.abort());
      return promise;
    })
      .rejects
      .toStrictEqual(err);

    expect(emitter).toBeCalledTimes(1);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', Object.assign(req, {
      implicitAbortBehavior: false,
      isRetryAfterRatelimit: false
    }));
  });
});

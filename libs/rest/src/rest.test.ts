import fetch, { Response, Headers } from 'node-fetch';
import Blob from 'fetch-blob';
import { Bucket } from './Bucket';
import { CordisRestError, HTTPError } from './Error';
import { RequestOptions, RestManager } from './RestManager';

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
    ...jest.requireActual<typeof import('@cordis/common')>('@cordis/common'),
    halt: jest
      .fn<Promise<void>, [number]>()
      .mockImplementation(timeout => {
        now.mockReturnValue(Date.now() + timeout);
        return Promise.resolve();
      })
  };
});

const mockedFetch = fetch as any as jest.Mock<Promise<Response>>;

let rest: RestManager;

beforeEach(() => {
  rest = new RestManager('token');
});

describe('buckets and rate limiting', () => {
  test('create bucket identifiers', () => {
    const general = Bucket.makeRoute('get', '/channels/12345678910111213');
    expect(general).toBe('/channels/12345678910111213');

    const messages = Bucket.makeRoute('get', '/channels/12345678910111213/messages');
    expect(messages).toBe('/channels/12345678910111213/messages');

    const first = Bucket.makeRoute('delete', '/channels/12345678910111213/messages/12345678910111213');
    expect(first).toBe('delete/channels/12345678910111213/messages/:id');
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
        url: ''
      });

      mockedFetch.mockResolvedValue(res.clone());

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data = await rest.make(req);

      expect(req.headers).toBeInstanceOf(Headers);
      expect(data).toStrictEqual(JSON.parse(value));
      expect(emitter).toBeCalledTimes(2);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
      expect(emitter).toHaveBeenLastCalledWith('response', req, JSON.parse(value), { limit: 5, timeout: 2500 });
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
          url: ''
        }),
        new Response(value, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Reset-After': '2.5'
          },
          status: 200,
          url: ''
        })
      ];

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++]));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data: Blob = await rest.make(req);
      let final = '';
      for await (const piece of data.stream()) final += piece;

      expect(JSON.parse(final)).toStrictEqual(JSON.parse(value));
      expect(emitter).toBeCalledTimes(4);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(2, 'ratelimit', 'channels/12345678910111213', 'channels/12345678910111213', false, 2500);
      expect(emitter).toHaveBeenNthCalledWith(3, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(4, 'response', req, data, { limit: 5, timeout: 2500 });
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
          url: ''
        }),
        new Response(value, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ratelimit-Limit': '5',
            'X-Ratelimit-Reset-After': '2.5'
          },
          status: 200,
          url: ''
        })
      ];

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++]));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      const data = await rest.make(req);

      expect(data).toStrictEqual(JSON.parse(value));
      expect(emitter).toBeCalledTimes(3);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(2, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(3, 'response', req, JSON.parse(value), { limit: 5, timeout: 2500 });
    });

    test('exceeding the retry limit', async () => {
      const value = '{"foo":"bar"}';
      const http500 = new Response(value, {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 500,
        url: ''
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
          url: ''
        })
      ];

      let calls = 0;
      mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++]));

      const emitter = jest.spyOn(rest, 'emit');
      const req: RequestOptions<{ test: string }, never> = {
        path: 'channels/12345678910111213',
        method: 'get',
        data: { test: '' }
      };

      await expect(() => rest.make(req))
        .rejects
        .toThrow(CordisRestError);

      expect(emitter).toBeCalledTimes(4);
      expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(2, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(3, 'request', req);
      expect(emitter).toHaveBeenNthCalledWith(4, 'request', req);
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
        status: 403,
        url: ''
      })
    ];

    let calls = 0;
    mockedFetch.mockImplementation(() => Promise.resolve(responses[calls++]));

    const emitter = jest.spyOn(rest, 'emit');
    const req: RequestOptions<{ test: string }, never> = {
      path: 'channels/12345678910111213',
      method: 'get',
      data: { test: '' }
    };

    await expect(() => rest.make(req))
      .rejects
      .toThrow(HTTPError);

    expect(emitter).toBeCalledTimes(1);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
  });

  test('timeout', async () => {
    // Makes setTimeout etc mock functions
    jest.useFakeTimers();

    const value = '{"foo":"bar"}';
    const response = new Response(value, {
      headers: {
        'Content-Type': 'application/json',
        'X-Ratelimit-Limit': '5',
        'X-Ratelimit-Reset-After': '2.5'
      },
      status: 200,
      url: ''
    });

    mockedFetch.mockImplementation(() => Promise.resolve(response));

    const emitter = jest.spyOn(rest, 'emit');
    const req: RequestOptions<{ test: string }, never> = {
      path: 'channels/12345678910111213',
      method: 'get',
      data: { test: '' }
    };

    await expect(() => {
      const promise = rest.make(req);
      jest.runAllTimers();
      return promise;
    })
      .rejects
      .toThrow(CordisRestError);

    expect(emitter).toBeCalledTimes(1);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
  });
});

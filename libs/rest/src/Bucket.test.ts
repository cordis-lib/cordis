import fetch, { Response, Headers } from 'node-fetch';
import { Bucket } from './Bucket';
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

test('create bucket identifiers', () => {
  const general = Bucket.makeRoute('get', '/channels/12345678910111213');
  expect(general).toBe('/channels/12345678910111213');

  const messages = Bucket.makeRoute('get', '/channels/12345678910111213/messages');
  expect(messages).toBe('/channels/12345678910111213/messages');

  const first = Bucket.makeRoute('get', '/channels/12345678910111213/messages/12345678910111213');
  expect(first).toBe('/channels/12345678910111213/messages/:id');
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
    expect(data).toStrictEqual({ foo: 'bar' });
    expect(emitter).toBeCalledTimes(2);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
    expect(emitter).toHaveBeenLastCalledWith('response', req, JSON.parse(value), { limit: 5, timeout: 2500 });
  });

  test('429 response', async () => {
    const value = '{"foo":"bar"}';
    const res429 = new Response(value, {
      headers: {
        'Content-Type': 'application/json',
        'X-Ratelimit-Limit': '5',
        'X-Ratelimit-Reset-After': '2.5',
        'Retry-After': '2.5'
      },
      status: 429,
      url: ''
    });

    const res200 = new Response(value, {
      headers: {
        'Content-Type': 'application/json',
        'X-Ratelimit-Limit': '5',
        'X-Ratelimit-Reset-After': '2.5'
      },
      status: 200,
      url: ''
    });

    let calls = 0;
    mockedFetch.mockImplementation(() => {
      if (calls++ === 0) return Promise.resolve(res429.clone());
      return Promise.resolve(res200.clone());
    });

    const emitter = jest.spyOn(rest, 'emit');
    const req: RequestOptions<{ test: string }, never> = {
      path: 'channels/12345678910111213',
      method: 'get',
      data: { test: '' }
    };

    const data = await rest.make(req);

    expect(req.headers).toBeInstanceOf(Headers);
    expect(data).toStrictEqual({ foo: 'bar' });
    expect(emitter).toBeCalledTimes(4);
    expect(emitter).toHaveBeenNthCalledWith(1, 'request', req);
    expect(emitter).toHaveBeenNthCalledWith(2, 'ratelimit', 'channels/12345678910111213', 'channels/12345678910111213', 2500);
    expect(emitter).toHaveBeenNthCalledWith(3, 'request', req);
    expect(emitter).toHaveBeenNthCalledWith(4, 'response', req, JSON.parse(value), { limit: 5, timeout: 2500 });
  });
});

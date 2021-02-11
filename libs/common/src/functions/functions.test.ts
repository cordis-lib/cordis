import { getMissingProps, halt, isPromise, keyMirror, makeDiscordCdnUrl } from './';
import { CordisUtilTypeError, CordisUtilRangeError } from '../error';

test('get missing props', () => {
  const obj = { one: 1, two: 2 };
  const schema = ['one', 'two', 'three'];

  expect(getMissingProps(obj, schema)).toStrictEqual(['three']);
});

test('halt', async () => {
  const timeStart = Date.now();

  await halt(100);
  expect(Date.now() - timeStart).toBeGreaterThanOrEqual(100);
});

describe('is promise', () => {
  test('not a promise', () => {
    expect(isPromise(null)).toBe(false);
    expect(isPromise({})).toBe(false);
  });

  test('a promise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
  });
});

test('key mirror', () => {
  expect(keyMirror(['b'])).toStrictEqual({ b: 'b' });
});

describe('make discord cdn url', () => {
  test('defaults using an image', () => {
    const root = 'e16be7c509d54bb53b1ee21fe8d8cdac';
    expect(makeDiscordCdnUrl(root)).toBe(`${root}.webp`);
  });

  test('defaults using a gif', () => {
    const root = 'a_bbab2f9b0bcecf438b4810c67798bfca';
    expect(makeDiscordCdnUrl(root)).toBe(`${root}.gif`);
  });

  test('non-dynamic with a gif', () => {
    const root = 'a_bbab2f9b0bcecf438b4810c67798bfca';
    expect(makeDiscordCdnUrl(root, { dynamic: false })).toBe(`${root}.webp`);
  });

  test('valid custom size', () => {
    const root = 'e16be7c509d54bb53b1ee21fe8d8cdac';
    expect(makeDiscordCdnUrl(root, { size: 16 })).toBe(`${root}.webp?size=16`);
  });

  describe('invalid options handling', () => {
    test('invalid format', () => {
      const root = 'e16be7c509d54bb53b1ee21fe8d8cdac';
      // @ts-expect-error Intentionally invalid format
      expect(() => makeDiscordCdnUrl(root, { format: 'asdf' })).toThrow(CordisUtilTypeError);
    });

    test('invalid size', () => {
      const root = 'e16be7c509d54bb53b1ee21fe8d8cdac';
      // @ts-expect-error Intentionally invalid size
      expect(() => makeDiscordCdnUrl(root, { size: 1 })).toThrow(CordisUtilRangeError);
    });
  });
});

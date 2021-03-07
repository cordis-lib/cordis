import { makeDiscordCdnUrl } from './';
import { CordisUtilTypeError, CordisUtilRangeError } from './error';

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

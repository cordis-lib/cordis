import { getMissingProps, halt, isPromise, keyMirror } from './';

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

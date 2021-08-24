import { getMissingProps, halt, isPromise, keyMirror } from './index';

test('get missing props', () => {
  const obj = { one: 1, two: 2 };
  const schema = ['one', 'two', 'three'];

  expect(getMissingProps(obj, schema)).toStrictEqual(['three']);
});

test('halt', async () => {
  jest.useFakeTimers('legacy');

  const cb = jest.fn();

  const promise = halt(100).then(cb);
  expect(setTimeout).toHaveBeenCalled();
  expect(cb).not.toHaveBeenCalled();

  jest.runAllTimers();

  await promise;
  expect(cb).toHaveBeenCalled();
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

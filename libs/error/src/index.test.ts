import makeCordisError from './';

const CordisTestError = makeCordisError(Error, { test: 'test', test2: (str: string) => str });

test('invalid message', () => {
  // @ts-expect-error
  expect(() => new CordisTestError('test3')).toThrow(TypeError);
});

describe('constructing an error', () => {
  test('regular message', () => {
    const instance = new CordisTestError('test');
    expect(instance.code).toBe('test');
    expect(instance.message).toBe('test');
    expect(instance.name).toBe('Error [test]');
    expect(instance.stack).not.toBeUndefined();
  });

  test('function based message', () => {
    const str = 'test2';
    const instance = new CordisTestError('test2', str);
    expect(instance.code).toBe('test2');
    expect(instance.message).toBe(str);
    expect(instance.name).toBe('Error [test2]');
    expect(instance.stack).not.toBeUndefined();
  });
});

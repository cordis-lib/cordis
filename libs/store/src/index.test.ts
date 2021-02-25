import { Store, CordisStoreTypeError } from './Store';

describe('constructing a store', () => {
  test('max size', () => {
    const store = new Store<number>({ maxSize: 1 });

    store.set('boop', 1);
    expect(store.size).toBe(1);
    expect(store.has('boop')).toBe(true);

    store.set('boop2', 1);
    expect(store.size).toBe(1);
    expect(store.has('boop')).toBe(false);
    expect(store.has('boop2')).toBe(true);
  });

  describe('auto emptying', () => {
    test('all elements', async () => {
      const store = new Store<number>({ emptyEvery: 300 });
      store.set('boop', 1);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(store.size).toBe(0);
      clearTimeout(store.emptyTimer!);
    });

    test('certain elements', async () => {
      const store = new Store<number>({ emptyEvery: 300, emptyCb: v => v === 1 });
      store.set('boop', 1);
      store.set('boop2', 2);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(store.has('boop')).toBe(false);
      expect(store.has('boop2')).toBe(true);

      clearTimeout(store.emptyTimer!);
    });
  });
});

test('finding a key/value', () => {
  const store = new Store<number>();
  store.set('boop', 1);
  store.set('boop2', 2);

  expect(store.findKey(v => v === 2)).toBe('boop2');
  expect(store.find((_, key) => key === 'boop2')).toBe(2);
});

test('filtering a store', () => {
  const store = new Store<number>();
  store.set('boop', 1);
  store.set('boop2', 2);

  expect(store.filter((_, key) => key === 'boop2')).toStrictEqual(new Store<number>({ entries: [['boop2', 2]] }));
});

test('sorting a store', () => {
  const store = new Store<number>();
  store.set('boop', 1);
  store.set('boop2', 2);

  expect(store.sort((a, b) => a - b)).toStrictEqual(new Store<number>({ entries: [['boop2', 2], ['boop', 1]] }));

  const otherstore = new Store<number>({ entries: [['boop', 1], ['boop2', 2]] });
  expect(store).toStrictEqual(otherstore);
  expect(store.sort()).toStrictEqual(otherstore);
});

test('mutable sort', () => {
  const store = new Store<number>();
  store.set('boop2', 2);
  store.set('boop', 1);

  const otherstore = new Store<number>({ entries: [['boop', 1], ['boop2', 2]] });
  expect(store.mSort()).toStrictEqual(otherstore);
  expect(store).toStrictEqual(otherstore);
});

test('mapping a store', () => {
  const store = new Store<number>();
  store.set('boop', 1);
  store.set('boop2', 2);

  expect(store.map(v => v + 1)).toStrictEqual([2, 3]);
});

test('emptying a store', () => {
  const store = new Store<number>();
  store.set('boop', 1);
  store.set('boop2', 2);

  store.empty();

  expect(store.size).toBe(0);
});

describe('reducing a store', () => {
  test('simple addition reducer', () => {
    const store = new Store<number>();
    store.set('boop', 1);
    store.set('boop2', 2);

    expect(store.reduce((acc, v) => acc + v)).toBe(3);
  });

  test('simple addition reducer with initial value', () => {
    const store = new Store<number>();
    store.set('boop', 1);
    store.set('boop2', 2);

    expect(store.reduce((acc, v) => acc + v, 1)).toBe(4);
  });

  test('reduce empty store with no initial value', () => {
    expect(
      () => new Store<number>().reduce((acc, v) => acc + v)
    ).toThrow(new CordisStoreTypeError('noReduceEmptyStore'));
  });
});


import { Store, CordisStoreTypeError } from './Store';

describe('constructing a bag', () => {
  test('max size', () => {
    const bag = new Store<number>({ maxSize: 1 });

    bag.set('boop', 1);
    expect(bag.size).toBe(1);
    expect(bag.has('boop')).toBe(true);

    bag.set('boop2', 1);
    expect(bag.size).toBe(1);
    expect(bag.has('boop')).toBe(false);
    expect(bag.has('boop2')).toBe(true);
  });

  describe('auto emptying', () => {
    test('all elements', async () => {
      const bag = new Store<number>({ emptyEvery: 300 });
      bag.set('boop', 1);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(bag.size).toBe(0);
    });

    test('certain elements', async () => {
      const bag = new Store<number>({ emptyEvery: 300, emptyCb: v => v === 1 });
      bag.set('boop', 1);
      bag.set('boop2', 2);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(bag.has('boop')).toBe(false);
      expect(bag.has('boop2')).toBe(true);
    });
  });
});

test('finding a key/value', () => {
  const bag = new Store<number>();
  bag.set('boop', 1);
  bag.set('boop2', 2);

  expect(bag.findKey(v => v === 2)).toBe('boop2');
  expect(bag.find((_, key) => key === 'boop2')).toBe(2);
});

test('filtering a bag', () => {
  const bag = new Store<number>();
  bag.set('boop', 1);
  bag.set('boop2', 2);

  expect(bag.filter((_, key) => key === 'boop2')).toStrictEqual(new Store<number>({ entries: [['boop2', 2]] }));
});

test('sorting a bag', () => {
  const bag = new Store<number>();
  bag.set('boop', 1);
  bag.set('boop2', 2);

  expect(bag.sort((a, b) => a - b)).toStrictEqual(new Store<number>({ entries: [['boop2', 2], ['boop', 1]] }));

  const otherBag = new Store<number>({ entries: [['boop', 1], ['boop2', 2]] });
  expect(bag).toStrictEqual(otherBag);
  expect(bag.sort()).toStrictEqual(otherBag);
});

test('mutable sort', () => {
  const bag = new Store<number>();
  bag.set('boop2', 2);
  bag.set('boop', 1);

  const otherBag = new Store<number>({ entries: [['boop', 1], ['boop2', 2]] });
  expect(bag.mSort()).toStrictEqual(otherBag);
  expect(bag).toStrictEqual(otherBag);
});

test('mapping a bag', () => {
  const bag = new Store<number>();
  bag.set('boop', 1);
  bag.set('boop2', 2);

  expect(bag.map(v => v + 1)).toStrictEqual([2, 3]);
});

test('emptying a bag', () => {
  const bag = new Store<number>();
  bag.set('boop', 1);
  bag.set('boop2', 2);

  bag.empty();

  expect(bag.size).toBe(0);
});

describe('reducing a bag', () => {
  test('simple addition reducer', () => {
    const bag = new Store<number>();
    bag.set('boop', 1);
    bag.set('boop2', 2);

    expect(bag.reduce((acc, v) => acc + v)).toBe(3);
  });

  test('simple addition reducer with initial value', () => {
    const bag = new Store<number>();
    bag.set('boop', 1);
    bag.set('boop2', 2);

    expect(bag.reduce((acc, v) => acc + v, 1)).toBe(4);
  });

  test('reduce empty bag with no initial value', () => {
    expect(
      () => new Store<number>().reduce((acc, v) => acc + v)
    ).toThrow(new CordisStoreTypeError('noReduceEmptyStore'));
  });
});


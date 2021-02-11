import { BitField, BitfieldRangeError } from './';

const flags = BitField.makeFlags(['first', 'second']);

test('static make flags', () => {
  expect(flags).toStrictEqual({ first: 1n << 0n, second: 1n << 1n });
});

test('resolve bit value', () => {
  const instance = new BitField(flags, 'first');
  expect(instance.resolve(flags.second)).toBe(flags.second);
  expect(instance.resolve('first')).toBe(flags.first);
  expect(instance.resolve(instance)).toBe(flags.first);

  // @ts-expect-error - Intentional ignorance of the type
  expect(() => instance.resolve(true)).toThrow(BitfieldRangeError);
});

test('bitfield iterator', () => {
  const instance = new BitField(flags, ['first', 'second']);
  const output = [];
  for (const flag of instance) output.push(flag);

  expect(output).toStrictEqual(['first', 'second']);
});

test('bitfield implementation specifics', () => {
  const instance = new BitField(flags, ['first']);
  expect(instance.toJSON()).toBe(instance.bits);
  expect(instance.valueOf()).toBe(instance.bits);

  const frozen = instance.freeze();
  expect(Object.isFrozen(frozen)).toBe(true);
});

test('bitfield any', () => {
  const one = new BitField(flags, ['first']);
  expect(one.any('first')).toBe(true);
  expect(one.any('second')).toBe(false);

  const both = new BitField(flags, ['first', 'second']);
  expect(both.any('first')).toBe(true);
  expect(both.any('second')).toBe(true);
  expect(both.any(['first', 'second'])).toBe(true);
});

test('bitfield equals', () => {
  expect(new BitField(flags, 'first').equals('first')).toBe(true);
});

test('bitfield has', () => {
  const one = new BitField(flags, ['first']);
  expect(one.has('first')).toBe(true);
  expect(one.has('second')).toBe(false);
  expect(one.has(['first', 'second'])).toBe(false);

  const both = new BitField(flags, ['first', 'second']);
  expect(both.has('first')).toBe(true);
  expect(both.has('second')).toBe(true);
  expect(both.has(['first', 'second'])).toBe(true);
  expect(both.has(['first'])).toBe(true);
});

test('bitfield missing', () => {
  const one = new BitField(flags, ['first']);
  expect(one.missing('first')).toStrictEqual([]);
  expect(one.missing('second')).toStrictEqual(['second']);
  expect(one.missing(['first', 'second'])).toStrictEqual(['second']);
});

test('bitfield add', () => {
  const one = new BitField(flags, 'first');
  expect(one.add('second').equals(['first', 'second'])).toBe(true);

  const both = new BitField(flags, ['first', 'second']);
  expect(both.add('second').equals(['first', 'second'])).toBe(true);
});

test('bitfield remove', () => {
  const one = new BitField(flags, 'first');
  expect(one.remove('first').equals([])).toBe(true);

  const both = new BitField(flags, ['first', 'second']);
  expect(both.remove('first').equals('second')).toBe(true);
});

test('bitfield serialize', () => {
  const instance = new BitField(flags, ['first']);
  expect(instance.serialize()).toStrictEqual({ first: true, second: false });
});

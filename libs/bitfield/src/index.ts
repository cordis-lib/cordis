import makeCordisError from '@cordis/error';

/**
 * @internal
 */
export const BitfieldRangeError = makeCordisError(RangeError, {
  bitfieldInvalid: 'Failed to resolve bits; expected a bigint, string, a Bitfield, or an array of any of the previous'
});

// ? Readonly<T> uses the `keyof` keyword, which ignores anything `Symbol` related
// ? This interface's properties are re-applied to a Readonly<BitField>, as such preserving the iterator and anything else that may go poof
// ? https://github.com/microsoft/TypeScript/issues/37182
/**
 * Internal interface used to re-apply properties that are removed by the built-in `Readonly<T>` type
 */
export interface UnsafeBitFieldProperties<K> {
  [Symbol.iterator](): Generator<K, void, undefined>;
}

/**
 * Use in your code to type Frozen bitfields - as `Readonly<T>` will eliminate the iterator.
 *
 * See: https://github.com/microsoft/TypeScript/issues/37182
 */
export type FrozenBitField<K extends string, T extends BitField<K>> = Readonly<T> & UnsafeBitFieldProperties<K>;

/**
 * A value that can be resolved to a bitfield
 */
export type BitFieldResolvable<T extends string> = | T | bigint | BitField<T> | (T | bigint | BitField<T>)[];

/**
 * Utility structure for interacting with bitfields
 * Heavily based on https://github.com/discordjs/discord.js/blob/master/src/util/BitField.js
 */
export class BitField<T extends string> {
  /**
   * Creates flags for a bitfield
   * @param flags An array of strings to use to create the flags
   * @returns An object, its keys being elements of your array and the values being `1 << corresponding_index`
   * @example
   * ```js
   * BitField.makeFlags(['MANAGE_ROLES', 'MANAGE_MEMBERS', 'ADMINISTRATOR']);
   * // Expected output: { MANAGE_ROLES: 1, MANAGE_MEMBERS: 2, ADMINISTRATOR: 4 }
   * ```
   */
  public static makeFlags<T extends string>(flags: T[]) {
    return flags.reduce(
      (acc, current, index) => {
        acc[current] = 1n << BigInt(index);
        return acc;
      },
      {} as Record<T, bigint>
    );
  }

  /**
   * Resolves a value into a bigint
   * @param bit Bit to resolve
   * @param flags The flags to look for
   */
  public static resolve<T extends string>(bit: BitFieldResolvable<T>, flags: Record<T, bigint>): bigint {
    if (typeof bit === 'bigint' && bit >= 0n) {
      return bit;
    }

    if (bit instanceof BitField) {
      return bit.bits;
    }

    if (typeof bit === 'string') {
      const num = flags[bit];
      /* istanbul ignore else */
      if (num) {
        return num;
      }
    }

    if (Array.isArray(bit)) {
      return bit.map(p => this.resolve(p, flags)).reduce((prev, p) => prev | p, 0n);
    }

    throw new BitfieldRangeError('bitfieldInvalid');
  }

  /**
   * Iterator for this bitfield's flags
   */
  public *[Symbol.iterator]() {
    yield *this.toArray();
  }

  /**
   * Flags representing this bitfield
   */
  public flags: Record<T, bigint>;

  /**
   * The bits that are currently being held
   */
  public bits: bigint;

  public ['constructor']!: typeof BitField;

  public constructor(
    flags: Record<T, bigint>,
    bits: BitFieldResolvable<T>
  ) {
    this.flags = flags;
    this.bits = this.resolve(bits);
  }

  /**
   * @returns An array of all the keys present in this bitfield
   */
  public toArray() {
    return (Object.keys(this.flags) as T[]).filter(b => this.has(b));
  }

  /**
   * Allows the BitField to be sanitized by `JSON.stringify` into a string representing the bits
   */
  public toJSON() {
    return String(this.bits);
  }

  /**
   * Used in various operations by the engine
   */
  public valueOf() {
    return this.bits;
  }

  /**
   * Freezes the bitfield, making it immutable
   */
  public freeze() {
    return Object.freeze(this) as FrozenBitField<T, this>;
  }

  /**
   * Checks if the bitfield is holding any of the given bits
   * @param bit Bits to check for
   */
  public any(bit: BitFieldResolvable<T>) {
    return (this.bits & this.resolve(bit)) !== 0n;
  }

  /**
   * Checks if the provided value is identical to the current bitfield
   * @param bit Bits to check for
   */
  public equals(bit: BitFieldResolvable<T>) {
    return this.bits === this.resolve(bit);
  }

  /**
   * Checks if the bitfield has all of the provided bids
   * @param bit Bits to check for
   */
  public has(bit: BitFieldResolvable<T>): boolean {
    if (Array.isArray(bit)) {
      return bit.every(b => this.has(b));
    }

    return (this.bits & this.resolve(bit)) !== 0n;
  }

  /**
   * Checks which of the given bits are missing from the current bitfield
   * @param bit Bits to check for
   * @returns An array of the missing bits
   */
  public missing(bit: BitFieldResolvable<T>) {
    if (!Array.isArray(bit)) {
      bit = new this.constructor(this.flags, bit).toArray();
    }

    return bit.filter(p => !this.has(p));
  }

  /**
   * Adds the given bits to the bitfield
   * @param bits Bits to add
   */
  public add(...bits: BitFieldResolvable<T>[]) {
    let total = 0n;
    for (const bit of bits) {
      total |= this.resolve(bit);
    }

    /* istanbul ignore if */
    if (Object.isFrozen(this)) {
      return new this.constructor(this.flags, this.bits | total);
    }

    this.bits |= total;
    return this;
  }

  /**
   * Removes the given bits from the bitfield
   * @param bits Bits to remove
   */
  public remove(...bits: BitFieldResolvable<T>[]) {
    let total = 0n;
    for (const bit of bits) {
      total |= this.resolve(bit);
    }

    /* istanbul ignore if */
    if (Object.isFrozen(this)) {
      return new this.constructor(this.flags, this.bits & ~total);
    }

    this.bits &= ~total;
    return this;
  }

  /**
   * Resolves a value into a bitfield, using the local flags
   * @param bit Value to resolve
   */
  public resolve(bit: BitFieldResolvable<T>): bigint {
    return this.constructor.resolve(bit, this.flags);
  }

  /**
   * Serializes the bitfield into an object reflecting which keys are present based off the given flags.
   * @example
   * ```js
   * const instance = new BitField(BitField.makeFlags(['beep', 'boop']), 'beep');
   * instance.serialize();
   * // Expected output: { beep: true, boop: false }
   * ```
   */
  public serialize(): Record<T, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries(this.flags)) {
      serialized[flag] = this.has(bit as bigint);
    }

    return serialized;
  }
}

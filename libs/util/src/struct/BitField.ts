// ? Readonly<T> uses the `keyof` operator, which ignores anything `Symbol` related
// ? This interface is reapplied to a Readonly<BitField>, as such preserving the iterator

import { CordisUtilRangeError } from '../error';

// ? https://github.com/microsoft/TypeScript/issues/37182
export interface UnsafeBitFieldProperties {
  [Symbol.iterator](): Generator<string, void, undefined>;
}

export type FrozenBitField<T extends BitField<any>> = Readonly<T> & UnsafeBitFieldProperties;

export type BitFieldResolvable<T extends string> = T | bigint | BitField<T> | (T | bigint | BitField<T>)[];

/**
 * Utility structure for interacting with bitfields
 * Heavily based on https://github.com/discordjs/discord.js/blob/master/src/util/BitField.js
 */
export class BitField<T extends string> {
  public static bigintify(bit: number) {
    return 1n << BigInt(bit);
  }

  public flags: Record<T, bigint>;
  public bits: bigint;

  public ['constructor']!: typeof BitField;

  public constructor(
    flags: Record<T, bigint>,
    bits: BitFieldResolvable<T>
  ) {
    this.flags = flags;
    this.bits = this.resolve(bits);
  }

  public *[Symbol.iterator]() {
    yield *this.toArray();
  }

  public resolve(bit: BitFieldResolvable<T> = 0n): bigint {
    if (typeof bit === 'number' && bit >= 0) return bit;
    if (bit instanceof BitField) return bit.bits;

    if (typeof bit === 'string') {
      const num = this.flags[bit];
      if (num) return num;
    }

    if (Array.isArray(bit)) return bit.map(p => this.resolve(p)).reduce((prev, p) => prev | p, 0n);

    throw new CordisUtilRangeError('bitfieldInvalid');
  }

  public freeze() {
    return Object.freeze(this) as FrozenBitField<this>;
  }

  public toArray() {
    return (Object.keys(this.flags) as T[]).filter(b => this.has(b));
  }

  public toJSON() {
    return this.bits;
  }

  public valueOf(asNumber: true): number;
  public valueOf(asNumber: false): bigint;
  public valueOf(asNumber = false) {
    return asNumber ? Number(asNumber) : this.bits;
  }

  public any(bit: BitFieldResolvable<T>) {
    return (this.bits & this.resolve(bit)) !== 0n;
  }

  public equals(bit: BitFieldResolvable<T>) {
    return this.bits === this.resolve(bit);
  }

  public has(bit: BitFieldResolvable<T>): boolean {
    if (Array.isArray(bit)) return bit.every(b => this.has(b));
    bit = this.resolve(bit);
    return (this.bits & bit) === bit;
  }

  public missing(bit: BitFieldResolvable<T>) {
    if (!Array.isArray(bit)) bit = new this.constructor(this.flags, bit).toArray();
    return bit.filter(p => !this.has(p));
  }

  public add(...bits: BitFieldResolvable<T>[]) {
    let total = 0n;
    for (const bit of bits) total |= this.resolve(bit);

    if (Object.isFrozen(this)) return new this.constructor(this.flags, this.bits | total);
    this.bits |= total;
    return this;
  }

  public remove(...bits: BitFieldResolvable<T>[]) {
    let total = 0n;
    for (const bit of bits) total |= this.resolve(bit);

    if (Object.isFrozen(this)) return new this.constructor(this.flags, this.bits & ~total);
    this.bits &= ~total;
    return this;
  }

  public serialize(): Record<T, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries(this.flags)) serialized[flag] = this.has(bit as bigint);
    return serialized;
  }
}

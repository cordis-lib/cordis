export const DISCORD_EPOCH = 1420070400000;

export interface SnowflakeCreationData {
  createdTimestamp: number;
  createdAt: Date;
}

export const getCreationData = (id: bigint | string | Snowflake): Readonly<SnowflakeCreationData> => {
  const { timestamp, date } = id instanceof Snowflake ? id : new Snowflake(id);
  return Object.freeze({
    createdTimestamp: timestamp,
    createdAt: date
  });
};

/**
 * Class representing a Discord snowflake and all if its properties
 */
export class Snowflake {
  public readonly raw: bigint;
  public readonly timestamp: number;
  public readonly date: Date;
  public readonly workerId: number;
  public readonly processId: number;
  public readonly increment: number;

  public constructor(id: bigint | string) {
    this.raw = BigInt(id);

    this.timestamp = Number((this.raw >> 22n) + BigInt(DISCORD_EPOCH));
    this.date = new Date(this.timestamp);
    this.workerId = Number((this.raw >> 17n) & 0b11111n);
    this.processId = Number((this.raw >> 12n) & 0b11111n);
    this.increment = Number(this.raw & 0b111111111111n);

    Object.freeze(this);
  }

  public toString() {
    return `${this.raw}`;
  }
}

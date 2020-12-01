export interface SnowflakeEntity {
  createdTimestamp: number;
  createdAt: Date;
}

/**
 * Class representing a Discord snowflake and all if its properties
 */
export class Snowflake {
  public static readonly discordEpoch = 1420070400000;

  public static idToBinary(id: string) {
    let bin = '';

    let high = parseInt(id.slice(0, -10)) || 0;
    let low = parseInt(id.slice(-10));

    while (low > 0 || high > 0) {
      bin = String(low & 1) + bin;
      low = Math.floor(low / 2);
      if (high > 0) {
        low += 5000000000 * (high % 2);
        high = Math.floor(high / 2);
      }
    }

    return bin;
  }

  public static deconstruct(id: string) {
    return new Snowflake(id).freeze();
  }

  public static getCreationData(id: string | Snowflake): SnowflakeEntity {
    const { timestamp } = id instanceof Snowflake ? id : Snowflake.deconstruct(id);
    return {
      createdTimestamp: timestamp,
      createdAt: new Date(timestamp)
    };
  }

  public binary: string;

  public get timestamp() {
    return parseInt(this.binary.substring(0, 42), 2) + Snowflake.discordEpoch;
  }

  public get date() {
    return new Date(this.timestamp);
  }

  public get workerID() {
    return parseInt(this.binary.substring(42, 47), 2);
  }

  public get processID() {
    return parseInt(this.binary.substring(47, 52), 2);
  }

  public get increment() {
    return parseInt(this.binary.substring(52, 64), 2);
  }

  public constructor(id: string) {
    this.binary = Snowflake.idToBinary(id).padStart(64, '0');
  }

  public freeze() {
    return Object.freeze(this);
  }
}

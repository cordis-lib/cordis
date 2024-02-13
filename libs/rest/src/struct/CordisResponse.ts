import { Headers, Response } from 'node-fetch';

/**
 * Wrapper around node-fetch Response for caching purposes
 */
export class CordisResponse {
  private _data?: unknown;

  public readonly headers = new Headers(this.res.headers);
  public readonly status = this.res.status;

  public get cached(): boolean {
    return this._data !== undefined;
  }

  public constructor(
    private readonly res: Response
  ) {}

  public async json(): Promise<unknown> {
    if (this._data) {
      return this._data;
    }

    const data = await this.res.json();
    this._data = data;
    return data;
  }

  public async blob(): Promise<unknown> {
    if (this._data) {
      return this._data;
    }

    const data = await this.res.blob();
    this._data = data;
    return data;
  }
}

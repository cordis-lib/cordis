/**
 * Creates a new promise and resolves it after the specified amount of time
 * @param time How long to wait for
 */
export const halt = (time: number) => new Promise<void>(res => setTimeout(res, time));

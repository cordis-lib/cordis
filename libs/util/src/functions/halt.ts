/**
 * Creates a new promise and resolves it after specified time
 * @param time How long to wait for
 */
export const halt = (time: number) => new Promise<void>(res => setTimeout(res, time));

import { Queue } from './';

let queue!: Queue<'test'>;

const runCb = () => Promise.resolve('test' as const);

beforeEach(() => {
  queue = new Queue();
});

test('error handling', async () => {
  await expect(queue.run(() => Promise.reject(new Error())))
    .rejects
    .toThrow();
});

describe('successful operations', () => {
  test('regular', async () => {
    expect(await queue.run(runCb)).toBe('test');
  });

  test('operations already queued', async () => {
    const first = jest.fn().mockImplementation(runCb);
    const second = jest.fn().mockImplementation(runCb);

    const res = queue.run(first);
    void queue.run(second);

    expect(first).toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    expect(await res).toBe('test');
    expect(second).not.toHaveBeenCalled();

    await new Promise(resolve => setImmediate(resolve));
    expect(second).toHaveBeenCalled();
  });

  test('priority', async () => {
    const first = jest.fn().mockImplementation(runCb);
    const second = jest.fn().mockImplementation(runCb);

    const res = queue.run(first);
    await queue.run(second, true);

    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();

    expect(await res).toBe('test');
    expect(second).toHaveBeenCalled();
  });
});

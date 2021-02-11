import { MemoryMutex } from './MemoryMutex';
import { halt } from '@cordis/common';

const mockedHalt = halt as any as jest.Mock<typeof halt>;

jest.mock('@cordis/common', () => {
  const start = Date.now();
  const now = jest.spyOn(Date, 'now').mockReturnValue(start);

  return {
    halt: jest
      .fn<Promise<void>, [number]>()
      .mockImplementation(timeout => {
        now.mockReturnValue(Date.now() + timeout);
        return Promise.resolve();
      })
  };
});

let mutex: MemoryMutex;

beforeEach(() => {
  mutex = new MemoryMutex();
});

afterEach(() => {
  mockedHalt.mockClear();
});

test('setting nothing changes nothing', async () => {
  jest.setTimeout(200);

  expect(mutex.set('foo', {})).toBeUndefined();
  expect(mutex.global).toBeNull();
  expect(await mutex.claim('foo')).toBeUndefined();
});

test('setting only the timeout does not cause delay', async () => {
  mutex.set('foo', { timeout: 5000 });
  await mutex.claim('foo');
  expect(mockedHalt).toHaveBeenCalledTimes(0);
});

test('setting only global does not cause delay', async () => {
  mutex.set('foo', { global: true });
  await mutex.claim('foo');
  expect(mockedHalt).toHaveBeenCalledTimes(0);
});

test('setting only limit does not cause delay', async () => {
  mutex.set('foo', { limit: 5 });
  await mutex.claim('foo');
  expect(mockedHalt).toHaveBeenCalledTimes(0);
});

test('setting timeout, limit causes delay', async () => {
  mutex.set('foo', { timeout: 5, limit: 1 });
  await mutex.claim('foo');
  expect(mockedHalt).toHaveBeenCalledTimes(0);

  await mutex.claim('foo');

  expect(mockedHalt).toHaveBeenCalledTimes(1);
  expect(mockedHalt).toHaveBeenCalledWith(5);
});

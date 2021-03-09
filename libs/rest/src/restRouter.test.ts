import { buildRestRouter } from './restRouter';
import { Rest } from './Rest';

const manager = Rest as any as Rest;
const mockedMake = manager.make as any as jest.Mock;

jest.mock('@cordis/rest', () => ({
  RestManager: {
    make: jest.fn()
  }
}));

const router = buildRestRouter(manager);

afterEach(() => {
  mockedMake.mockClear();
});

test('basic routing', async () => {
  await router.users['123'].get();

  expect(mockedMake).toHaveBeenCalledTimes(1);
  expect(mockedMake).toHaveBeenCalledWith({ method: 'get', path: '/users/123' });
});

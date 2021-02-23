import { buildRestRouter } from './restRouter';
import { RestManager } from '@cordis/rest';

const manager = RestManager as any as RestManager;
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

test('basic routing', () => {
  router.users['123'].get();

  expect(mockedMake).toHaveBeenCalledTimes(1);
  expect(mockedMake).toHaveBeenCalledWith({ method: 'get', path: '/users/123' });
});

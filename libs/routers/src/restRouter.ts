import type { RestManager } from '@cordis/rest';
import type { IRouter } from './IRouter';

/**
 * Creates a rest router
 * @example
 * ```js
 * const { buildRestRouter } = require('@cordis/router');
 * const { RestManager } = require('@cordis/rest');
 *
 * const manager = new RestManager(yourToken);
 * const router = buildRestRouter(manager);
 *
 * const user = await router.users[someUserId].get();
 * console.log(user);
 * ```
 * @param manager REST manager
 */
export const buildRestRouter = (manager: RestManager) => {
  const method: string[] = [''];
  const handler: ProxyHandler<IRouter> = {
    get(_, property) {
      if (
        property === 'get' ||
        property === 'delete' ||
        property === 'patch' ||
        property === 'put' ||
        property === 'post'
      ) {
        return (options: any) => manager.make({ path: method.join('/'), method: property, ...options });
      }

      if (typeof property === 'string') method.push(property);

      return new Proxy<IRouter>({} as any, handler);
    }
  };

  return new Proxy<IRouter>({} as any, handler);
};

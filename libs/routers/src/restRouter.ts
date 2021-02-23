import type { RestManager } from '@cordis/rest';
import type { IRouter } from './IRouter';

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

import { RestManager } from '@cordis/rest';
import { Gateway } from './services/Gateway';
import { BuiltInFunctions, FunctionManager } from './FunctionManager';
import { CORDIS_AMQP_SYMBOLS, Events, RedisStore } from '@cordis/util';
import type * as amqp from 'amqplib';
import type { Redis } from 'ioredis';

/**
 * This is the core factory, it constructs a root object with all of the context needed for all of the other functions to work
 */
const coreFactory = (
  auth: string,
  channel: amqp.Channel,
  redis: Redis,
  events: (keyof Events)[] = Object.values(CORDIS_AMQP_SYMBOLS.gateway.events),
  worker = true
) => {
  const rest = new RestManager(auth, { store: hash => new RedisStore({ redis, hash }) });

  // eslint-disable-next-line prefer-const
  let gateway!: Gateway;

  const functionManager = new FunctionManager({ rest, gateway });
  gateway = new Gateway(channel, redis, functionManager);

  const functions = new Proxy<FunctionManager & BuiltInFunctions>(functionManager as any, {
    // @ts-ignore
    get: (target, key) => target.retrieveFunction(key) ?? target[key] // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  });

  return {
    functions,
    rest,
    gateway,
    async init() {
      return gateway.init({ keys: events, worker });
    }
  };
};

export default coreFactory;

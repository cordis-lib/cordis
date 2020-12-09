import * as amqp from 'amqplib';
import { Rest } from './services/Rest';
import { Gateway } from './services/Gateway';
import { Redis } from 'ioredis';
import { BuiltInFunctions, FunctionManager } from './FunctionManager';
import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Events, RedisStore } from '@cordis/util';
import { rawData } from './util/Symbols';
import { CordisUser } from './Types';

/**
 * This is the core factory, it constructs a root object with all of the context needed for all of the other functions to work
 */
const coreFactory = (
  channel: amqp.Channel,
  redis: Redis,
  events: (keyof Events)[] = Object.values(CORDIS_AMQP_SYMBOLS.gateway.events),
  worker = true
) => {
  const rest = new Rest(channel);
  const users: RedisStore<CordisUser> = new RedisStore({
    redis,
    hash: CORDIS_REDIS_SYMBOLS.cache.users,
    convertorOut: data => functions.sanatizeUser(data),
    convertorIn: data => data[rawData]
  });

  const functionManager = new FunctionManager({ rest, users });
  const gateway = new Gateway(channel, redis, functionManager);

  const functions = new Proxy<FunctionManager & BuiltInFunctions>(functionManager as any, {
    // @ts-ignore
    get: (target, key) => target.retrieveFunction(key) ?? target[key] // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  });

  return {
    functions,
    rest,
    gateway,
    async init() {
      await rest.init();
      return gateway.init({ keys: events, worker });
    }
  };
};

export default coreFactory;

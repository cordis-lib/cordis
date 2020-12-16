import * as amqp from 'amqplib';
import { Rest } from './services/Rest';
import { Gateway } from './services/Gateway';
import { Redis } from 'ioredis';
import { BuiltInFunctions, FunctionManager } from './FunctionManager';
import { CORDIS_AMQP_SYMBOLS, Events } from '@cordis/util';

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
      await rest.init();
      return gateway.init({ keys: events, worker });
    }
  };
};

export default coreFactory;

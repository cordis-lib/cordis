import * as amqp from 'amqplib';
import { Rest } from './services/Rest';
import { Gateway } from './services/Gateway';
import { Redis } from 'ioredis';

import { BuiltInFunctions, FunctionManager } from './util/FunctionManager';

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

  const gateway = new Gateway(channel, redis);

  const functionManager = new FunctionManager({});
  const functions = new Proxy<FunctionManager & BuiltInFunctions>(functionManager as any, {
    get: <K extends keyof BuiltInFunctions>(target: FunctionManager, key: K) => target.retrieveFunction(key)
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

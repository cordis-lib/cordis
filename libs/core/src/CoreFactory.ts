import { RestManager } from '@cordis/rest';
import { Gateway } from './services/Gateway';
import { CORDIS_AMQP_SYMBOLS, Events, RedisStore } from '@cordis/common';
import { container } from 'tsyringe';
import { kFunctions, kMeta } from './util/Symbols';
import * as functions from './functions';
import type * as amqp from 'amqplib';
import type { Redis } from 'ioredis';

export interface Meta {
  rest: RestManager;
  gateway: Gateway;
}

export type Functions = { [K in keyof typeof functions]: typeof functions[K] };

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
  const gateway = container.resolve(Gateway);

  container.register<Meta>(kMeta, {
    useValue: {
      gateway: gateway,
      rest
    }
  });

  container.register<Functions>(kFunctions, { useValue: functions });

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

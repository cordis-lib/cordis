import { RoutingClient } from '@cordis/brokers';
import { CORDIS_AMQP_SYMBOLS, Events } from '@cordis/util';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

export interface GatewayOptions {
  keys: (keyof Events)[];
  worker?: boolean;
}

export interface Gateway {
  on<E extends keyof Events, T extends Events[E]>(event: E, listener: (data: T) => any): this;
  once<E extends keyof Events, T extends Events[E]>(event: E, listener: (data: T) => any): this;
}

export class Gateway extends EventEmitter {
  public service: RoutingClient<Events[keyof Events]>;

  public constructor(channel: amqp.Channel, redis: Redis) {
    super();
    this.service = new RoutingClient(channel, redis);
  }

  public init(options: GatewayOptions) {
    return this.service.init(
      CORDIS_AMQP_SYMBOLS.gateway.packets,
      options.keys,
      false,
      options.worker
    );
  }
}

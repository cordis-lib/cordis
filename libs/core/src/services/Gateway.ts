import { RoutingClient } from '@cordis/brokers';
import { CORDIS_AMQP_SYMBOLS, CORDIS_EVENTS, Events } from '@cordis/util';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { GatewayCommands } from './GatewayCommands';
import { GatewaySendPayload } from 'discord-api-types';
import { CordisClientUser } from '../Types';
import { FunctionManager } from '../FunctionManager';

export interface GatewayOptions {
  keys: (keyof Events)[];
  worker?: boolean;
}

export interface Gateway {
  on<E extends keyof Events, T extends Events[E]>(event: E, listener: (data: T) => any): this;
  once<E extends keyof Events, T extends Events[E]>(event: E, listener: (data: T) => any): this;
}

export class Gateway extends EventEmitter {
  private readonly _commands: GatewayCommands;

  public readonly service: RoutingClient<keyof Events, Events>;
  public clientUser?: CordisClientUser;

  public constructor(channel: amqp.Channel, redis: Redis, public readonly functions: FunctionManager) {
    super();
    this._commands = new GatewayCommands(channel);
    this.service = new RoutingClient(channel, redis);
  }

  public send(options: GatewaySendPayload) {
    return this._commands.send(options);
  }

  public init(options: GatewayOptions) {
    this.service.on(CORDIS_EVENTS.ready, data => {
      this.clientUser = this.functions.retrieveFunction('sanatizeClientUser')(data.user);
    });

    return this.service.init(
      CORDIS_AMQP_SYMBOLS.gateway.packets,
      options.keys,
      false,
      options.worker
    );
  }
}

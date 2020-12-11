import { RoutingClient } from '@cordis/brokers';
import { CORDIS_AMQP_SYMBOLS, Events } from '@cordis/util';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { GatewayCommands } from './GatewayCommands';
import { GatewaySendPayload } from 'discord-api-types';
import { ClientUser, CoreEvents } from '../Types';
import { FunctionManager } from '../FunctionManager';

export interface GatewayOptions {
  keys: (keyof Events)[];
  worker?: boolean;
}

export interface Gateway {
  on<E extends keyof CoreEvents, T extends CoreEvents[E]>(event: E, listener: (data: T) => any): this;
  once<E extends keyof CoreEvents, T extends CoreEvents[E]>(event: E, listener: (data: T) => any): this;
  emit<E extends keyof CoreEvents, T extends CoreEvents[E]>(event: E, data: T): boolean;
}

export class Gateway extends EventEmitter {
  public readonly events: { [K in keyof CoreEvents]: (data: Events[K]) => CoreEvents[K] } = {
    ready: data => [(this.clientUser = this.functions.retrieveFunction('sanatizeClientUser')(data.user))],
    userUpdate: data => {
      const sanatizeUser = this.functions.retrieveFunction('sanatizeUser');
      return [sanatizeUser(data.n), sanatizeUser(data.o)];
    }
  };

  private readonly _commands: GatewayCommands;

  public readonly service: RoutingClient<keyof CoreEvents, Events>;
  public clientUser?: ClientUser;

  public constructor(channel: amqp.Channel, redis: Redis, public readonly functions: FunctionManager) {
    super();
    this._commands = new GatewayCommands(channel);
    this.service = new RoutingClient(channel, redis);
  }

  public send(options: GatewaySendPayload) {
    return this._commands.send(options);
  }

  public init(options: GatewayOptions) {
    for (const key of options.keys) {
      // @ts-ignore
      // TODO compile without ts-ignore
      this.service.on(key, data => this.emit(key, ...this.events[key](data)));
    }

    return this.service.init(
      CORDIS_AMQP_SYMBOLS.gateway.packets,
      options.keys,
      false,
      options.worker
    );
  }
}

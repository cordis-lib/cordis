import { EventEmitter } from 'events';
import { BrokerUtil } from './BrokerUtil';
import type * as amqp from 'amqplib';

export interface Broker extends EventEmitter {
  on(event: 'error', listener: (error: any) => any): this;

  once(event: 'error', listener: (error: any) => any): this;

  emit(event: 'error', error: any): boolean;
}

export class Broker extends EventEmitter {
  public readonly consumers = new Set<string>();

  public readonly util = new BrokerUtil(this);

  protected constructor(
    public readonly channel: amqp.Channel
  ) {
    super();
  }

  public async destroy() {
    try {
      for (const tag of this.consumers) await this.channel.cancel(tag);
    } catch {}

    this.consumers.clear();
  }
}

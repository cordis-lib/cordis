import { EventEmitter } from 'events';
import { BrokerUtil } from './BrokerUtil';
import type * as amqp from 'amqplib';

export interface Broker extends EventEmitter {
  /**
   * Event used mostly for internal errors
   * @event
   */
  on(event: 'error', listener: (error: any) => any): this;

  /** @internal */
  once(event: 'error', listener: (error: any) => any): this;

  /** @internal */
  emit(event: 'error', error: any): boolean;
}

/**
 * Base message broker class
 * @noInheritDoc
 */
export class Broker extends EventEmitter {
  /**
   * Current active consumers
   */
  public readonly consumers = new Set<string>();

  /**
   * Utils for this broker
   */
  public readonly util = new BrokerUtil(this);

  protected constructor(
    /**
     * "Channel" being used to interface with your AMQP server
     */
    public readonly channel: amqp.Channel
  ) {
    super();
  }

  /**
   * Destroys the broker, cancelling all consumers
   */
  public async destroy() {
    try {
      for (const tag of this.consumers) await this.channel.cancel(tag);
    } catch {}

    this.consumers.clear();
  }
}

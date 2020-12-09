import { RpcClient } from '@cordis/brokers';
import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import * as amqp from 'amqplib';
import { GatewaySendPayload } from 'discord-api-types';

export class GatewayCommands {
  public service: RpcClient<void, GatewaySendPayload>;

  public constructor(channel: amqp.Channel) {
    this.service = new RpcClient(channel);
  }

  public send(options: GatewaySendPayload) {
    return this.service.post(options);
  }

  public init() {
    return this.service.init(CORDIS_AMQP_SYMBOLS.rest.queue);
  }
}

import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayWebhooksUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const webhooksUpdate: Handler<GatewayWebhooksUpdateDispatch['d']> = (data, service) =>
  service.publish(data, CORDIS_AMQP_SYMBOLS.gateway.events.webhooksUpdate);

export default webhooksUpdate;

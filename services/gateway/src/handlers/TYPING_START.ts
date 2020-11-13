import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayTypingStartDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const typingStart: Handler<GatewayTypingStartDispatch['d']> = (data, service) =>
  service.publish(data, CORDIS_AMQP_SYMBOLS.gateway.events.typingStart);

export default typingStart;

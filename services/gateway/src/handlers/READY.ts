import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayReadyDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const ready: Handler<GatewayReadyDispatch['d']> = (data, service) => service.publish(data, CORDIS_AMQP_SYMBOLS.gateway.events.ready);

export default ready;

import { CORDIS_AMQP_SYMBOLS, Patcher } from '@cordis/util';
import { GatewayReadyDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const ready: Handler<GatewayReadyDispatch['d']> = (data, service) => {
  const { data: user } = Patcher.patchClientUser(data.user);
  service.publish({ ...data, user }, CORDIS_AMQP_SYMBOLS.gateway.events.ready);
};

export default ready;

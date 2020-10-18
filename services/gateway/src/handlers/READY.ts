import { GatewayReadyDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const ready: Handler<GatewayReadyDispatch['d']> = (data, service, _, __, [, updateUser]) => {
  service.publish(data, 'ready');
  updateUser(data.user);
};

export default ready;

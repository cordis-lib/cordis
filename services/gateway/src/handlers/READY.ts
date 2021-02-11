import { GatewayReadyDispatchData } from 'discord-api-types/v8';
import { kService, kUser } from '../Symbols';
import { container } from 'tsyringe';

const ready = (data: GatewayReadyDispatchData) => {
  const service = container.resolve(kService);

  const { data: user } = Patcher.patchClientUser(data.user);
  service.publish({ ...data, user }, CORDIS_AMQP_SYMBOLS.gateway.events.ready);
};

export default ready;

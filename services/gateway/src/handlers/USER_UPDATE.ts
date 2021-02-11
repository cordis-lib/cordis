import { CORDIS_AMQP_SYMBOLS, Patcher } from '@cordis/common';
import { APIUser } from 'discord-api-types';
import { Handler } from '../Handler';

const userUpdate: Handler<APIUser> = (data, service, _, __, user) => {
  const { data: n, old: o } = Patcher.patchClientUser(data, user);
  service.publish({ n, o }, CORDIS_AMQP_SYMBOLS.gateway.events.botUserUpdate);
};

export default userUpdate;

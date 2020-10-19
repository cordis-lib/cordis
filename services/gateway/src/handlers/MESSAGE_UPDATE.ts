import { Patcher } from '@cordis/util';
import { GatewayMessageUpdateDispatch, APIMessage } from 'discord-api-types';
import { Handler } from '../Handler';

const messageUpdate: Handler<GatewayMessageUpdateDispatch['d']> = async (data, service, cache) => {
  let message = await cache.get<APIMessage>(`${data.channel_id}_messages`, data.id);

  if (message) {
    const { data: patchedMessage, old: o } = Patcher.patchMessage(data, message);
    message = patchedMessage;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    service.publish({ o: o!, n: message }, 'messageUpdate');
  } else {
    const { data: patchedMessage } = Patcher.patchMessage(data);
    message = patchedMessage;
  }

  await cache.set(`${data.channel_id}_messages`, message.id, message);
};

export default messageUpdate;

import { CORDIS_AMQP_SYMBOLS, CORDIS_REDIS_SYMBOLS, Patcher } from '@cordis/util';
import { GatewayMessageDeleteBulkDispatch, APIMessage } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDeleteBulk: Handler<GatewayMessageDeleteBulkDispatch['d']> = async (data, service, cache) => {
  const store = await cache.get<APIMessage>(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id));

  const messages = await store
    .getM(...data.ids)
    .then(
      d => d
        .filter(e => e !== null)
        .map(e => Patcher.patchMessage(e as APIMessage).data)
    );

  service.publish(messages, CORDIS_AMQP_SYMBOLS.gateway.events.bulkMessageDelete);
  await store.deleteM(CORDIS_REDIS_SYMBOLS.cache.messages(data.channel_id), ...data.ids);
};

export default messageDeleteBulk;

import { Patcher, RedisStore } from '@cordis/util';
import { GatewayMessageDeleteBulkDispatch, APIMessage } from 'discord-api-types';
import { Handler } from '../Handler';

const messageDeleteBulk: Handler<GatewayMessageDeleteBulkDispatch['d']> = async (data, service, cache) => {
  const store = (
    cache.stores.get(`${data.channel_id}_messages`) ??
    cache.registerStore({ hash: `${data.channel_id}_messages` })
  ) as RedisStore<APIMessage>;

  const messages = await store
    .getM(...data.ids)
    .then(
      d => d
        .filter(e => e !== null)
        .map(e => Patcher.patchMessage(e as APIMessage).data)
    );

  service.publish(messages, 'bulkMessageDelete');
  await store.deleteM(`${data.channel_id}_messages`, ...data.ids);
};

export default messageDeleteBulk;

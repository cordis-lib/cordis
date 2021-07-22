import config from './args';
import { createAmqp, RoutingPublisher } from '@cordis/brokers';
import { Cluster } from '@cordis/gateway';
import type { DiscordEvents } from '@cordis/common';

const main = async () => {
  const { channel, connection } = await createAmqp(config.amqpHost);
  connection
    .on('error', e => console.error(`[AMQP ERROR]: ${e}`))
    .on('close', () => {
      console.error('[AMQP EXIT]');
      process.exit(1);
    });

  const service = new RoutingPublisher<keyof DiscordEvents, DiscordEvents>(channel);
  const cluster = new Cluster(config.auth, config.ws);

  cluster
    .on('disconnecting', id => console.log(`[DISCONNECTING]: Shard id ${id}`))
    .on('reconnecting', id => console.log(`[RECONNECTING]: Shard id ${id}`))
    .on('open', id => console.log(`[CONNECTION OPEN]: Shard id ${id}`))
    .on('error', (err, id) => console.error(`[SHARD ERROR]: Shard id ${id}`, err))
    .on('ready', () => console.log('[READY]: All shards have fully connected'))
    .on('dispatch', data => service.publish(data.t, data.d));

  if (config.debug) {
    cluster.on('debug', (info, id) => console.log(`[DEBUG]: Shard id ${id}`, info));
  }

  try {
    await service.init({ name: 'gateway', topicBased: false });
    await cluster.connect();
  } catch (e) {
    console.error('Failed to initialize the service or the cluster', e);
    process.exit(1);
  }
};

void main();

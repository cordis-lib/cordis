import * as yargs from 'yargs';
import { createAmqp, RoutingServer, RpcServer } from '@cordis/brokers';
import createRedis, { Redis } from 'ioredis';
import { Cluster, IntentKeys } from '@cordis/gateway';
import type { DiscordEvents } from '@cordis/common';
import type { GatewaySendPayload } from 'discord-api-types/v8';

const main = async () => {
  const { argv } = yargs
    .env('CORDIS')
    .option('auth', {
      global: true,
      description: 'The token used to identify to Discord',
      type: 'string',
      demandOption: 'A token is required'
    })
    .option('amqp-host', {
      global: true,
      description: 'AMQP server host',
      type: 'string',
      demandOption: 'An AMQP server host is required'
    })
    .option('debug', {
      'global': true,
      'description': 'Whether or not you want debugging information',
      'type': 'boolean',
      'default': false
    })
    .option('shard-count', {
      global: true,
      description: 'How many shards are being spawned for the gateway',
      type: 'number',
      demandOption: false
    })
    .option('starting-shard', {
      'global': true,
      'description': 'ID of the first shard that this cluster should spawn',
      'type': 'number',
      'default': 0
    })
    .option('total-shard-count', {
      global: true,
      description: 'How many shards are being spawned across all clusters',
      type: 'number',
      demandOption: false
    })
    .option('redis-url', {
      global: true,
      description: 'URL for connecting to your redis instance',
      type: 'string',
      demandOption: false
    })
    .option('ws-compress', {
      'global': true,
      'description': 'Whether or not to use compression',
      'type': 'boolean',
      'default': true
    })
    .option('ws-encoding', {
      'global': true,
      'description': 'What websocket encoding to use, JSON or ETF',
      'type': 'string',
      'default': 'etf'
    })
    .option('ws-open-timeout', {
      global: true,
      description: 'How long to wait for the websocket connection to open before abandoning',
      type: 'number',
      demandOption: false
    })
    .option('ws-hello-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us the hello payload before abandoning',
      type: 'number',
      demandOption: false
    })
    .option('ws-ready-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us the ready payload before abandoning',
      type: 'number',
      demandOption: false
    })
    .option('ws-guild-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us all of the guilds before marking the rest of them as unavailable',
      type: 'number',
      demandOption: false
    })
    .option('ws-reconnect-timeout', {
      global: true,
      description: 'How long to wait for a successful resume before starting over',
      type: 'number',
      demandOption: false
    })
    .option('ws-large-threshold', {
      global: true,
      description: 'Between 50 and 250, number of members where the gateway will stop sending offline members in the guild member list',
      type: 'number',
      demandOption: false
    })
    .option('ws-intents', {
      global: true,
      description: 'The intents to use for the gateway connection(s)',
      type: 'string',
      array: true,
      demandOption: false
    })
    .help();

  const { channel, connection } = await createAmqp(argv['amqp-host']);
  connection
    .on('error', e => console.error(`[AMQP ERROR]: ${e}`))
    .on('close', () => {
      console.error('[AMQP EXIT]');
      process.exit(1);
    });

  let redis: Redis | null = null;
  if (argv['redis-url']) {
    redis = new createRedis(argv['redis-url']);
  }

  const service = new RoutingServer<keyof DiscordEvents, DiscordEvents>(channel);
  const cluster = new Cluster(
    argv.auth,
    {
      compress: argv['ws-compress'],
      encoding: argv['ws-encoding'] as 'json' | 'etf',
      openTimeout: argv['ws-open-timeout'],
      helloTimeout: argv['ws-hello-timeout'],
      discordReadyTimeout: argv['ws-ready-timeout'],
      guildTimeout: argv['ws-guild-timeout'],
      reconnectTimeout: argv['ws-reconnect-timeout'],
      largeThreshold: argv['ws-large-threshold'],
      intents: argv['ws-intents'] as IntentKeys[],
      redis: redis ?? undefined,
      shardCount: argv['shard-count'],
      startingShard: argv['starting-shard'],
      totalShardCount: argv['total-shard-count']
    }
  );

  const gatewayCommandsServer = new RpcServer<void, GatewaySendPayload>(channel);
  await gatewayCommandsServer.init({
    name: 'gateway_commands',
    cb: req => cluster.broadcast(req)
  });

  cluster
    .on('disconnecting', id => console.log(`[DISCONNECTING]: Shard id ${id}`))
    .on('reconnecting', id => console.log(`[RECONNECTING]: Shard id ${id}`))
    .on('open', id => console.log(`[CONNECTION OPEN]: Shard id ${id}`))
    .on('error', (err, id) => console.error(`[SHARD ERROR]: Shard id ${id}`, err))
    .on('ready', () => console.log('[READY]: All shards have fully connected'))
    .on('dispatch', data => service.publish(data.t, data.d));

  if (argv.debug) cluster.on('debug', (info, id) => console.log(`[DEBUG]: Shard id ${id}`, info));

  try {
    await service.init({ name: 'gateway', topicBased: false });
    await cluster.connect();
  } catch (e) {
    console.error('Failed to initialize the service or the cluster', e);
    process.exit(1);
  }
};

void main();

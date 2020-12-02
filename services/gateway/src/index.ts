import * as yargs from 'yargs';
import * as redis from 'ioredis';
import { RoutingServer, RpcClient, RpcServer } from '@cordis/brokers';
import { Cluster, IntentKeys } from '@cordis/gateway';
import { RedisCache, createAmqp, Events, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { RequestBuilderOptions } from '@cordis/rest';
import { Channel } from 'amqplib';
import { Handler } from './Handler';
import { GatewaySendPayload } from 'discord-api-types';

const main = async () => {
  const { argv } = yargs
    .env('CORDIS')
    .option('auth', {
      global: true,
      description: 'The token used to identify to Discord',
      demandOption: 'A token is required',
      type: 'string'
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
      required: false
    })
    .option('cluster-count', {
      'global': true,
      'description': 'How many clusters you intend to spawn',
      'type': 'number',
      'default': 1
    })
    .option('cluster-id', {
      global: true,
      description: 'What identifier this cluster has',
      demandOption: 'A cluster ID is required.',
      type: 'number'
    })
    .option('amqp-host', {
      global: true,
      description: 'AMQP host',
      type: 'string',
      required: false
    })
    .option('redis-host', {
      global: true,
      description: 'Where your redis instance is hosted',
      type: 'string',
      required: false
    })
    .option('redis-port', {
      global: true,
      description: 'The port your redis instance is exposed on',
      type: 'number',
      required: false
    })
    .option('redis-auth', {
      global: true,
      description: 'Your redis password',
      type: 'string',
      required: false
    })
    .option('redis-db', {
      global: true,
      description: 'Which redis database to use',
      type: 'number',
      required: false
    })
    .option('ws-compress', {
      global: true,
      description: 'Whether or not to use compression; please make sure you have zlib-sync installed',
      type: 'boolean',
      required: false
    })
    .option('ws-encoding', {
      global: true,
      description: 'What websocket encoding to use, JSON or ETF. If you wish to use ETF please make sure discord/erlpack is installed',
      type: 'string',
      required: false
    })
    .option('ws-open-timeout', {
      global: true,
      description: 'How long to wait for the websocket connection to open before abandoning',
      type: 'number',
      required: false
    })
    .option('ws-hello-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us the hello payload before abandoning',
      type: 'number',
      required: false
    })
    .option('ws-ready-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us the ready payload before abandoning',
      type: 'number',
      required: false
    })
    .option('ws-guild-timeout', {
      global: true,
      description: 'How long to wait for Discord to give us all of the guilds before marking the rest of them as unavailable',
      type: 'number',
      required: false
    })
    .option('ws-reconnect-timeout', {
      global: true,
      description: 'How long to wait for a successful resume before starting over',
      type: 'number',
      required: false
    })
    .option('ws-large-threshold', {
      global: true,
      description: 'Between 50 and 250, number of members where the gateway will stop sending offline members in the guild member list',
      type: 'number',
      required: false
    })
    .option('ws-intents', {
      'global': true,
      'description': 'The intents to use for the gateway connection(s)',
      'type': 'string',
      'array': true,
      'default': ['all']
    })
    .help();

  const redisClient = new redis({
    host: argv['redis-host'],
    port: argv['redis-port'],
    password: argv['redis-auth'],
    db: argv['redis-db']
  });

  const cache = new RedisCache(redisClient);

  const log = (label: string) => (data: any, shard: any) => console.log(`[${label.toUpperCase()} -> ${shard}]: ${data}`);

  let amqpChannel!: Channel;
  await (async function registerChannel() {
    const { channel } = (await createAmqp(
      argv['amqp-host'] ?? 'localhost',
      () => registerChannel(),
      e => log('amqp error')(e, 'CLUSTER')
    ))!;

    amqpChannel = channel;
  })();

  const service = new RoutingServer<Events[keyof Events]>(amqpChannel);
  const ws = new Cluster(
    argv.auth,
    {
      compress: argv['ws-compress'],
      encoding: argv['ws-encoding'] as 'json' | 'etf' | undefined,
      openTimeout: argv['ws-open-timeout'],
      helloTimeout: argv['ws-hello-timeout'],
      discordReadyTimeout: argv['ws-ready-timeout'],
      guildTimeout: argv['ws-guild-timeout'],
      reconnectTimeout: argv['ws-reconnect-timeout'],
      largeThreshold: argv['ws-large-threshold'],
      intents: argv['ws-intents'] as IntentKeys[]
    }
  );

  const { shards } = await ws.fetchGateway();
  const total = argv['shard-count'] ?? shards;
  const count = total / argv['cluster-count'];

  ws.wsTotalShardCount = total;
  ws.shardCount = total / count;
  ws.clusterId = argv['cluster-id'];

  await redisClient.set(CORDIS_REDIS_SYMBOLS.internal.gateway.shardCount, total);
  await redisClient.set(CORDIS_REDIS_SYMBOLS.internal.gateway.clusters.count, argv['cluster-count']);
  await redisClient.set(CORDIS_REDIS_SYMBOLS.internal.gateway.clusters.shardCount, count);
  await redisClient.set(CORDIS_REDIS_SYMBOLS.internal.gateway.clusters.currentlySpawning, argv['cluster-id']);

  const gatewayCommandsServer = new RpcServer<void, GatewaySendPayload>(amqpChannel);
  await gatewayCommandsServer.init(
    CORDIS_AMQP_SYMBOLS.gateway.commands,
    req => ws.broadcast(req)
  );

  const rest = new RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>(amqpChannel);
  await rest.init(CORDIS_AMQP_SYMBOLS.rest.queue);

  ws
    .on('disconnecting', shard => log('disconnecting')(null, shard))
    .on('reconecting', shard => log('reconecting')(null, shard))
    .on('open', shard => log('open')(null, shard))
    .on('error', log('error'))
    .on('ready', (options, shards) => log('ready')(`Spawned ${shards} shards from config ${options}`, 'CLUSTER'))
    .on(
      'dispatch',
      async (data, shard) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { default: handle }: { default?: Handler<any> } = require(`./handlers/${data.t}`);
          await handle?.(data.d, service, cache, rest, ws.user!);
        } catch (e) {
          log('packet error')(e.stack ?? e.toString(), `${shard} -> ${data.t}`);
        }
      }
    );

  if (argv.debug) ws.on('debug', log('debug'));

  await service.init(CORDIS_AMQP_SYMBOLS.gateway.packets, false)
    .then(() => console.log('Service is live, waiting for the gateway to sign in...'))
    .catch(console.error);
  await ws.connect()
    .catch(console.error);
};

void main();

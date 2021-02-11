import 'reflect-metadata';
import * as yargs from 'yargs';
import { RoutingServer, RpcServer } from '@cordis/brokers';
import { RestManager } from '@cordis/rest';
import { Cluster, IntentKeys } from '@cordis/gateway';
import { createAmqp } from '@cordis/amqp';
import { CORDIS_AMQP_SYMBOLS, SYMBOLS } from '@cordis/common';
import { container } from 'tsyringe';
import { kRest, kService } from './Symbols';
import Redis from 'ioredis';
import { RedisStore } from '@cordis/redis-store';
import type { GatewaySendPayload, GatewayDispatchPayload } from 'discord-api-types/v8';

type GatewayData = { [K in GatewayDispatchPayload['t']]: (GatewayDispatchPayload & { t: K })['d'] };

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
    .option('total-shard-count', {
      global: true,
      description: 'How many shards are being spawned across all clusters',
      type: 'number',
      required: false
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
      'default': ['guilds']
    })
    .help();

  const log = (label: string) => (data: any, shard: any) => console.log(`[${label.toUpperCase()} -> ${shard}]: ${data}`);

  const { channel: amqpChannel } = await createAmqp({
    host: argv['amqp-host'] ?? 'localhost',
    onError: e => console.log(`[AMQP ERROR]: ${e}`),
    onClose: () => {
      console.log('[AMQP EXIT]');
      process.exit(0);
    }
  });

  const redis = new Redis(process.env.REDIS_URL);
  container.register(SYMBOLS.store, {
    useValue: new RedisStore({
      redis,
      hash: ''
    })
  });

  const service = new RoutingServer<GatewayDispatchPayload['t'], GatewayDispatchPayload['d']>(amqpChannel);
  const cluster = new Cluster(
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

  const rest = new RestManager(argv.auth);

  container.register(kService, { useValue: service });
  container.register(kRest, { useValue: rest });

  const { shards } = await cluster.fetchGateway();
  const shardCount = argv['shard-count'] ?? shards;
  const totalShardCount = argv['total-shard-count'] ?? shards;

  cluster.shardCount = shardCount;
  cluster.totalShardCount = totalShardCount;

  const gatewayCommandsServer = new RpcServer<void, GatewaySendPayload>(amqpChannel);
  await gatewayCommandsServer.init(
    CORDIS_AMQP_SYMBOLS.gateway.commands,
    req => cluster.broadcast(req)
  );

  cluster
    .on('disconnecting', shard => log('disconnecting')(null, shard))
    .on('reconecting', shard => log('reconecting')(null, shard))
    .on('open', shard => log('open')(null, shard))
    .on('error', log('error'))
    .on('ready', (options, shards) => log('ready')(`Spawned ${shards} shards from config ${options}`, 'CLUSTER'))
    .on(
      'dispatch',
      async (data, shard) => {
        let handler: (data: any) => any;

        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const res = require(`./handlers/${data.t}`);
          handler = res.default;
        } catch {
          handler = () => service.publish(data.d, data.t);
        }

        try {
          await handler(data);
        } catch (e) {
          log('packet error')(e.stack ?? e.toString(), `${shard} -> ${data.t}`);
        }
      }
    );

  if (argv.debug) cluster.on('debug', log('debug'));

  await service.init(CORDIS_AMQP_SYMBOLS.gateway.packets, false)
    .then(() => console.log('Service is live, waiting for the gateway to sign in...'))
    .catch(console.error);
  await cluster.connect()
    .catch(console.error);
};

void main();

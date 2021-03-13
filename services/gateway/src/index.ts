import 'reflect-metadata';
import { container } from 'tsyringe';
import * as yargs from 'yargs';
import { createAmqp, RoutingServer, PubSubClient } from '@cordis/brokers';
import { Cluster, IntentKeys } from '@cordis/gateway';
import { DiscordEvents, GatewayServiceConfig, GATEWAY_INJECTION_TOKENS } from '@cordis/common';
import type { GatewaySendPayload } from 'discord-api-types/v8';

const loadExtension = async (name: string) => {
  try {
    await require(`../extensions/${name}`);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') console.error(`[${name.toUpperCase()} EXTENSION ERROR]`, e);
  }
};

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
      'global': true,
      'description': 'How many shards are being spawned for the gateway',
      'type': 'number',
      'demandOption': false,
      'default': 'auto' as const
    })
    .option('starting-shard', {
      'global': true,
      'description': 'ID of the first shard that this cluster should spawn',
      'type': 'number',
      'default': 0
    })
    .option('total-shard-count', {
      'global': true,
      'description': 'How many shards are being spawned across all clusters',
      'type': 'number',
      'demandOption': false,
      'default': 'auto' as const
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
      'default': 'etf' as const
    })
    .option('ws-open-timeout', {
      'global': true,
      'description': 'How long to wait for the websocket connection to open before abandoning',
      'type': 'number',
      'demandOption': false,
      'default': 6e4
    })
    .option('ws-hello-timeout', {
      'global': true,
      'description': 'How long to wait for Discord to give us the hello payload before abandoning',
      'type': 'number',
      'demandOption': false,
      'default': 6e4
    })
    .option('ws-ready-timeout', {
      'global': true,
      'description': 'How long to wait for Discord to give us the ready payload before abandoning',
      'type': 'number',
      'demandOption': false,
      'default': 6e4
    })
    .option('ws-guild-timeout', {
      'global': true,
      'description': 'How long to wait for Discord to give us all of the guilds before marking the rest of them as unavailable',
      'type': 'number',
      'demandOption': false,
      'default': 1e4
    })
    .option('ws-reconnect-timeout', {
      'global': true,
      'description': 'How long to wait for a successful resume before starting over',
      'type': 'number',
      'demandOption': false,
      'default': 6e4
    })
    .option('ws-large-threshold', {
      'global': true,
      'description': 'Between 50 and 250, number of members where the gateway will stop sending offline members in the guild member list',
      'type': 'number',
      'demandOption': false,
      'default': 250
    })
    .option('ws-intents', {
      'global': true,
      'description': 'The intents to use for the gateway connection(s)',
      'type': 'string',
      'array': true,
      'demandOption': false,
      'default': ['nonPrivileged']
    })
    .help();

  const config: GatewayServiceConfig = {
    auth: argv.auth,
    amqpHost: argv['amqp-host'],
    debug: argv.debug,
    shardCount: argv['shard-count'],
    startingShard: argv['starting-shard'],
    totalShardCount: argv['total-shard-count'],
    ws: {
      compress: argv['ws-compress'],
      encoding: argv['ws-encoding'],
      timeouts: {
        open: argv['ws-open-timeout'],
        hello: argv['ws-hello-timeout'],
        ready: argv['ws-ready-timeout'],
        guild: argv['ws-guild-timeout'],
        reconnect: argv['ws-reconnect-timeout']
      },
      largeThreshold: argv['ws-large-threshold'],
      intents: argv['ws-intents']
    }
  };

  container.register(GATEWAY_INJECTION_TOKENS.kConfig, { useValue: config });

  await loadExtension('pre-setup');

  const { channel, connection } = await createAmqp(argv['amqp-host']);
  connection
    .on('error', e => console.error(`[AMQP ERROR]: ${e}`))
    .on('close', () => {
      console.error('[AMQP EXIT]');
      process.exit(1);
    });

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
      shardCount: argv['shard-count'],
      startingShard: argv['starting-shard'],
      totalShardCount: argv['total-shard-count']
    }
  );

  const gatewayCommandsServer = new PubSubClient<GatewaySendPayload>(channel);
  await gatewayCommandsServer.init({
    name: 'gateway_commands',
    fanout: true,
    cb: req => cluster.broadcast(req)
  });

  container.register(GATEWAY_INJECTION_TOKENS.amqp.kChannel, { useValue: channel });
  container.register(GATEWAY_INJECTION_TOKENS.amqp.kConnection, { useValue: connection });
  container.register(GATEWAY_INJECTION_TOKENS.amqp.kService, { useValue: service });
  container.register(GATEWAY_INJECTION_TOKENS.amqp.kCommandsServer, { useValue: gatewayCommandsServer });
  container.register(GATEWAY_INJECTION_TOKENS.kCluster, { useValue: cluster });

  cluster
    .on('disconnecting', id => console.log(`[DISCONNECTING]: Shard id ${id}`))
    .on('reconnecting', id => console.log(`[RECONNECTING]: Shard id ${id}`))
    .on('open', id => console.log(`[CONNECTION OPEN]: Shard id ${id}`))
    .on('error', (err, id) => console.error(`[SHARD ERROR]: Shard id ${id}`, err))
    .on('ready', () => console.log('[READY]: All shards have fully connected'))
    .on('dispatch', data => service.publish(data.t, data.d));

  await loadExtension('pre-init');

  if (argv.debug) cluster.on('debug', (info, id) => console.log(`[DEBUG]: Shard id ${id}`, info));

  try {
    await service.init({ name: 'gateway', topicBased: false });
    await cluster.connect();

    await loadExtension('post-init');
  } catch (e) {
    console.error('Failed to initialize the service or the cluster', e);
    process.exit(1);
  }
};

void main();

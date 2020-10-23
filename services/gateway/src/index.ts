import * as yargs from 'yargs';
import * as redis from 'ioredis';
import { RoutingServer, RpcClient } from '@cordis/brokers';
import { WebsocketManager } from '@cordis/gateway';
import { createAmqp, Events, IntentKeys } from '@cordis/util';
import { Channel } from 'amqplib';
import { RequestBuilderOptions } from '@cordis/rest';
import { StoreManager } from './StoreManager';
import { Handler } from './Handler';
import { APIUser } from 'discord-api-types';

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
      description: 'How many shards to spawn; leave none for automatic',
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
      'default': ['all']
    })
    .help();

  process.env.DEBUG = String(argv.debug);

  const cache = new StoreManager(
    new redis({
      host: argv['redis-host'],
      port: argv['redis-port'],
      password: argv['redis-auth'],
      db: argv['redis-db']
    })
  );

  const log = (label: string) => (data: any, shard: any) => console.log(`[${label.toUpperCase()} -> ${shard}]: ${data}`);

  let amqpChannel!: Channel;

  await (async function registerChannel() {
    const { channel } = (await createAmqp(
      argv['amqp-host'] ?? 'localhost',
      () => registerChannel(),
      e => log('amqp error')(e, 'MANAGER')
    ))!;

    amqpChannel = channel;
  })();

  const rest = new RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>(amqpChannel);
  await rest.init('rest');

  const service = new RoutingServer<Events[keyof Events]>(amqpChannel);
  const ws = new WebsocketManager(
    argv.auth,
    argv['shard-count'],
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

  let botUser: APIUser = await rest.post({ path: '/users/@me' });
  const updateBotUser = (data: APIUser) => botUser = data;

  ws
    .on('disconnecting', shard => log('disconnecting')(null, shard))
    .on('reconecting', shard => log('reconecting')(null, shard))
    .on('open', shard => log('open')(null, shard))
    .on('error', log('error'))
    .on('ready', (options, shards) => log('ready')(`Spawned ${shards} shards from config ${options}`, 'MANAGER'))
    .on(
      'dispatch',
      async (data, shard) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { default: handle }: { default?: Handler<any> } = require(`./handlers/${data.t}`);
          await handle?.(data.d, service, cache, rest, [botUser, updateBotUser]);
        } catch (e) {
          log('packet error')(e.stack ?? e.toString(), `${shard} -> ${data.t}`);
        }
      }
    );

  if (argv.debug) ws.on('debug', log('debug'));

  await service.init('gateway', false)
    .then(() => console.log('Service is live, waiting for the gateway to sign in...'))
    .catch(console.error);
  await ws.connect()
    .catch(console.error);
};

void main();

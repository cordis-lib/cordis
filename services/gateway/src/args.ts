import * as yargs from 'yargs';

export default yargs
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
  .help()
  .argv;

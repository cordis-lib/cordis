import * as yargs from 'yargs';
import { RpcServer } from '@cordis/brokers';
import { RestManager, RequestBuilderOptions } from '@cordis/rest';

const main = async () => {
  const { argv } = yargs
    .env('CORDIS')
    .option('auth', {
      global: true,
      description: 'The token used to identify to Discord',
      demandOption: 'A token is required',
      type: 'string'
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
    .option('rest-retries', {
      global: true,
      description: 'How many times to retry a request before giving up',
      type: 'number',
      required: false
    })
    .option('amqp-host', {
      global: true,
      description: 'AMQP host',
      type: 'string',
      required: false
    })
    .option('rest-abortin', {
      'global': true,
      'description': 'How long to wait before failing a request',
      'type': 'number',
      'default': 6e4
    })
    .option('rest-version', {
      global: true,
      description: 'What version of the api to use',
      type: 'number',
      required: false
    })
    .help();

  const service = new RpcServer<any, Partial<RequestBuilderOptions> & { path: string }>(argv['amqp-host']);
  const rest = new RestManager(
    argv.auth,
    {
      retries: argv['rest-retries'],
      abortIn: argv['rest-retries'],
      apiVersion: argv['rest-version']
    }
  )
    .on('request', request => console.log(`Making request ${request.method?.toUpperCase() ?? 'GET'} ${request.path}...`))
    .on(
      'response',
      (req, res, state) => console.log(
        `[${req.method?.toUpperCase() ?? 'GET'} ${req.path}]:`, res,
        '\nCurrent ratelimit state:', state
      )
    )
    .on(
      'ratelimit',
      (bucket, endpoint, prevented, waiting) =>
        console.log(`[${endpoint}]: bucket ${bucket} ${prevented ? 'prevented' : 'hit'} a ratelimit, waiting for ${waiting}ms`)
    );

  service.on('error', e => console.error(e));

  await service.init(
    'rest',
    req => rest.make(req)
  )
    .then(() => console.log('Service is live!'))
    .catch(console.error);
};

void main();

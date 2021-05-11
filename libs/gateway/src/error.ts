import makeCordisError from '@cordis/error';
import { WebsocketConnectionStatus } from './websocket/WebsocketConnection';

/** @internal */
export const CordisGatewayError = makeCordisError(
  Error,
  {
    tokenInvalid: 'The token you passed is invalid',
    invalidShard: 'An invalid shard was provided to Discord',
    shardingRequired: 'Sharding is required for this bot to connect',
    notConnectable: (id: number, status: WebsocketConnectionStatus) =>
      `Shard<${id}>#connect was called, but the shard's current status is: ${WebsocketConnectionStatus[status]}`,
    timeoutHit: (name: string, waitedFor: number) => `The timeout with the name of "${name}" was hit, waited for ${waitedFor}`,
    invalidApiVersion: 'The API version you are attempting to use is invalid. Are you messing with library internals?',
    invalidIntents: (intents: number) => `The intents provided to Discord, ${intents}, are invalid.`,
    disallowedIntents: (intents: string[]) => `You were attempting to use intents that you are not allowed to use: ${intents.join(', ')}`
  }
);

/** @internal */
export const CordisGatewayTypeError = makeCordisError(
  TypeError,
  {
    invalidEncoding: 'Encoding was set to "etf", but erlpack is missing',
    invalidCompression: 'Compression was set to true, but zlib is missing'
  }
);

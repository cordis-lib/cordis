import { makeCordisError } from '@cordis/util';
import { WebsocketShardStatus } from './websocket/WebsocketShard';

/* eslint-disable @typescript-eslint/naming-convention */
export const CordisGatewayError = makeCordisError(
  Error,
  {
    fetchGatewayFail: 'Failed to fetch /gateway/bot',
    tokenInvalid: 'The token you passed is invalid',
    invalidShard: 'An invalid shard was provided to Discord',
    shardingRequired: 'Sharding is required for this bot to connect.',
    notConnectable: (id: number, status: WebsocketShardStatus) =>
      `Shard<${id}>#connect was called, but the shard's current status is: ${WebsocketShardStatus[status]}`,
    timeoutHit: (name: string, waitedFor: number) => `The timeout with the name of "${name}" was hit, waited for ${waitedFor}`
  }
);

export const CordisGatewayTypeError = makeCordisError(
  TypeError,
  {
    invalidEncoding: 'Encoding was set to "etf", but erlpack is missing',
    invalidCompression: 'Compression was set to true, but zlib is missing'
  }
);
/* eslint-enable @typescript-eslint/naming-convention */

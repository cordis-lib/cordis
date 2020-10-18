import { RoutingServer, RpcClient } from '@cordis/brokers';
import { RequestBuilderOptions } from '@cordis/rest';
import { APIUser } from 'discord-api-types';
import { Events } from '@cordis/util';
import { Redis } from 'ioredis';

export type Handler<T> = (
  data: T,
  service: RoutingServer<Events[keyof Events]>,
  redis: Redis,
  rest: RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>,
  user: [APIUser, (data: APIUser) => any]
) => any;

import { RoutingServer, RpcClient } from '@cordis/brokers';
import { RequestBuilderOptions } from '@cordis/rest';
import { APIUser } from 'discord-api-types';
import { RedisCache, Events } from '@cordis/util';

export type Handler<T> = (
  data: T,
  service: RoutingServer<Events[keyof Events]>,
  cache: RedisCache,
  rest: RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>,
  user: APIUser
) => any;

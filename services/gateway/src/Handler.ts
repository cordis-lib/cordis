import { RoutingServer, RpcClient } from '@cordis/brokers';
import { RequestBuilderOptions } from '@cordis/rest';
import { User } from '@cordis/types';
import { Events } from '@cordis/util';
import { Redis } from 'ioredis';

export type Handler<T> = (
  data: T,
  service: RoutingServer<Events[keyof Events]>,
  redis: Redis,
  rest: RpcClient<any, Partial<RequestBuilderOptions> & { path: string }>,
  user: [User, (data: User) => any]
) => any;

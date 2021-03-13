import { EventEmitter } from 'events';
import {
  WebsocketConnection,
  WebsocketConnectionStatus,
  WebsocketConnectionOptions,
  WebsocketConnectionDestroyOptions,
  WebsocketConnectionConnectOptions
} from './WebsocketConnection';
import { stripIndent } from 'common-tags';
import { Rest, MemoryMutex, RedisMutex } from '@cordis/rest';
import {
  APIUser,
  GatewayDispatchPayload,
  GatewaySendPayload,
  RESTGetAPIGatewayBotResult,
  Routes
} from 'discord-api-types/v8';
import type { Redis } from 'ioredis';

/**
 * Options for creating a cluster
 */
export interface ClusterOptions extends WebsocketConnectionOptions {
  /**
   * How many shards to spawn for this cluster
   */
  shardCount?: number | 'auto';
  /**
   * In case you have multiple clusters - you'll need to speceify first ID for this cluster's shards
   */
  startingShard?: number;
  /**
   * How many shards you intend to spawn across all clusters
   */
  totalShardCount?: number | 'auto';
  /**
   * Optional IORedis instance for cross-worker storage
   */
  redis?: Redis;
}

/* eslint-disable @typescript-eslint/unified-signatures */
export interface Cluster {
  /**
   * Fired when one of a shard's connection opens
   * @event
   */
  on(event: 'open', listener: (id: string | number) => any): this;
  /**
   * Fired when one of the shards begins reconnecting
   * @event
   */
  on(event: 'reconnecting', listener: (id: string | number) => any): this;
  /**
   * Fired when one of the shards begins disconnecting
   * @event
   */
  on(event: 'disconnecting', listener: (id: string | number) => any): this;
  /**
   * Provides information useful for debugging
   * @event
   */
  on(event: 'debug', listener: (info: any, id: string | number) => any): this;
  /**
   * Fired when a gateway connection gives an error event or when a payload is not successfully sent
   * @event
   */
  on(event: 'error', listener: (info: any, id: string | number) => any): this;
  /**
   * Fired when all of the shards under this cluster become ready
   * @event
   */
  on(event: 'ready', listener: () => any): this;
  /**
   * Any gateway event from a Shard that is currently {@link WebsocketConnectionStatus.ready}
   */
  on(event: 'dispatch', listener: (data: GatewayDispatchPayload, id: string | number) => any): this;

  /** @internal */
  once(event: 'open' | 'reconnecting' | 'disconnecting', listener: (id: string | number) => any): this;
  /** @internal */
  once(event: 'debug' | 'error', listener: (info: any, id: string | number) => any): this;
  /** @internal */
  once(event: 'ready', listener: () => any): this;
  /** @internal */
  once(event: 'dispatch', listener: (data: GatewayDispatchPayload, id: string | number) => any): this;

  /** @internal */
  emit(event: 'open' | 'reconnecting' | 'disconnecting', id: string | number): boolean;
  /** @internal */
  emit(event: 'debug' | 'error', info: any, id: string | number): boolean;
  /** @internal */
  emit(event: 'ready'): boolean;
  /** @internal */
  emit(event: 'dispatch', data: GatewayDispatchPayload, id: string | number): boolean;
}
/* eslint-enable @typescript-eslint/unified-signatures */

/**
 * The entry point for the cordis gateway
 * @noInheritDoc
 */
export class Cluster extends EventEmitter {
  /**
   * Options for constructing each shard
   */
  private readonly _shardOptions: WebsocketConnectionOptions;
  /**
   * Cache from the last gateway fetch call
   */
  private _fetchGatewayCache?: RESTGetAPIGatewayBotResult;

  /**
   * An array of all of the active shards
   */
  public readonly shards: WebsocketConnection[] = [];

  /**
   * REST instance
   */
  public readonly rest: Rest;

  /**
   * First shard ID for this cluster
   */
  public readonly startingShard: number;

  /**
   * Amount of shards under this cluster
   */
  public shardCount: number | 'auto';

  /**
   * Amount of shards under all clusters
   */
  public totalShardCount: number | 'auto';

  /**
   * The last time an identify payload was sent on behalf of this token
   * This is kept due to the fact that Discord wants you to wait 5 seconds in between each one
   */
  public lastIdentify = -1;

  /**
   * Client user given in the Discord ready event
   */
  public user: APIUser | null = null;

  /**
   * Average ping between all of the shards
   */
  public get ping() {
    const ping = this.shards.map(s => s.ping);
    return ping.reduce((a, b) => a + b) / this.shards.length;
  }

  /**
   * Wether or not all of the shards are ready or not
   */
  public get ready() {
    return this.shards.every(s => s.status === WebsocketConnectionStatus.ready);
  }

  /**
   * How many shards were actually spawned
   */
  public get shardsSpawned() {
    return this.shards.length;
  }

  /**
   * @param auth The Discord token for your bot
   * @param options Options for this cluster
   */
  public constructor(
    public readonly auth: string,
    options: ClusterOptions = {}
  ) {
    super();

    const {
      shardCount = 'auto',
      startingShard = 0,
      totalShardCount = shardCount,
      redis,
      ...shardOptions
    } = options;

    this.rest = new Rest(auth, { mutex: redis ? new RedisMutex(redis) : new MemoryMutex() });
    this.shardCount = shardCount;
    this.startingShard = startingShard;
    this.totalShardCount = totalShardCount;
    this._shardOptions = shardOptions;
  }

  protected _debug(log: string) {
    this.emit('debug', log, 'MANAGER');
  }

  /**
   * Broadcasts a payload to every single shard
   */
  public async broadcast(payload: GatewaySendPayload) {
    for (const shard of this.shards) await shard.send(payload, false);
  }

  /**
   * Fetches the Discord gateway, obtaining recommended sharding data
   * @param ignoreCache Wether the cache should be simply ignored
   * @returns Discord gateway information
   */
  public async fetchGateway(ignoreCache = false) {
    if (this._fetchGatewayCache && !ignoreCache) return this._fetchGatewayCache;

    const data = await this.rest.get<RESTGetAPIGatewayBotResult>(Routes.gatewayBot());

    this._fetchGatewayCache = data;
    return data;
  }

  /**
   * Spawns all of the shards (if not yet spawned) and connects each one to the gateway
   * @param options Array of connection options for each shard
   */
  public async connect(options?: (WebsocketConnectionConnectOptions | undefined)[]) {
    if (!this.shards.length) {
      const {
        url,
        shards: recommendedShards,
        session_start_limit: sessionInformation
      } = await this.fetchGateway();

      this._debug(stripIndent`
        Fetched Gateway Information
          URL: ${url}
          Recommended Shards: ${recommendedShards}
          Session Limit Information
            Total: ${sessionInformation.total}
            Remaining: ${sessionInformation.remaining}
      `);

      if (this.shardCount === 'auto') this.shardCount = recommendedShards;
      if (this.totalShardCount === 'auto') this.totalShardCount = recommendedShards;

      for (let i = this.startingShard; i < this.startingShard + this.shardCount; i++) {
        this.shards.push(new WebsocketConnection(this, i, url, this._shardOptions));
      }
    }

    return Promise.all(this.shards.map((shard, i) => shard.connect(options?.[i])));
  }

  /**
   * Destroys the cluster and all of the shards
   */
  public async destroy(options: WebsocketConnectionDestroyOptions = { fatal: true }) {
    this.user = null;

    return Promise.all(this.shards.map(shard => shard.destroy(options)));
  }
}

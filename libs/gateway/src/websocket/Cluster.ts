import { EventEmitter } from 'events';
import fetch, { Headers } from 'node-fetch';
import { CordisGatewayError } from '../error';
import { CONSTANTS } from '../util';
import {
  WebsocketConnection,
  WebsocketConnectionStatus,
  WebsocketConnectionOptions,
  WebsocketConnectionDestroyOptions
} from './WebsocketConnection';
import { APIUser, GatewayDispatchPayload, GatewaySendPayload, RESTGetAPIGatewayBotResult } from 'discord-api-types';
import { CORDIS_META } from '@cordis/util';
import { stripIndent } from 'common-tags';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Fired when one of the shards opens
 * @asMemberOf Cluster
 * @event Cluster#open
 */
declare function open(id: number): any;

/**
 * Fired when one of the shards begins reconnecting
 * @asMemberOf Cluster
 * @event Cluster#reconnecting
 */
declare function reconnecting(id: number): any;

/**
 * Fired when one of the shards begins disconnecting
 * @asMemberOf Cluster
 * @event Cluster#disconnecting
 */
declare function disconnecting(id: number): any;

/**
 * Provides information useful for debugging
 * @asMemberOf Cluster
 * @event Cluster#debug
 */
declare function debug(info: any, id: number): any;

/**
 * Fired when a gateway connection gives an error event or when a payload is not successfully sent
 * @asMemberOf Cluster
 * @event Cluster#error
 */
declare function error(info: any, id: number): any;

/**
 * Fired when all of the shards under this manager become ready
 * @asMemberOf Cluster
 * @event Cluster#ready
 */
declare function ready(shardOptions: number | 'auto', shards: number): any;

/**
 * Any gateway event after the Shard has become READY
 * @asMemberOf Cluster
 * @event Cluster#dispatch
 */
declare function dispatch(data: GatewayDispatchPayload, id: number): any;

/* eslint-enable @typescript-eslint/no-unused-vars */

export interface ClusterOptions extends WebsocketConnectionOptions {
  /**
   * The total amount of websocket shards/connections that should be spawned across all clusters
   */
  wsTotalShardCount: number | 'auto';
  /**
   * How many shards to spawn for this cluster
   */
  shardCount: number | 'auto';
  /**
   * The unique identifier for this cluster
   */
  clusterId: number;
}

export interface Cluster {
  on(event: 'open' | 'reconecting' | 'disconnecting', listener: typeof open): this;
  on(event: 'debug' | 'error', listener: typeof debug): this;
  on(event: 'ready', listener: typeof ready): this;
  on(event: 'dispatch', listener: typeof dispatch): this;

  once(event: 'open' | 'reconecting' | 'disconnecting', listener: typeof open): this;
  once(event: 'debug' | 'error', listener: typeof debug): this;
  once(event: 'ready', listener: typeof ready): this;
  once(event: 'dispatch', listener: typeof dispatch): this;

  emit(event: 'open' | 'ready' | 'reconecting' | 'disconnecting', id: number): boolean;
  emit(event: 'debug' | 'error', info: any, id: number): boolean;
  emit(event: 'ready', shardOptions: number | 'auto', shards: number): boolean;
  emit(event: 'dispatch', data: GatewayDispatchPayload, id: number): this;
}

/**
 * The entry point for the cordis gateway
 * @noInheritDoc
 */
export class Cluster extends EventEmitter {
  /**
   * An array of all of the WebsocketShards
   */
  public readonly shards: WebsocketConnection[] = [];

  public clusterId: number;
  public wsTotalShardCount: number | 'auto';
  public shardCount: number | 'auto';

  /**
   * The last time an identify payload was sent on behalf of this token
   * This is kept due to the fact that Discord wants you to wait 5 seconds in between each one
   */
  public lastIdentify = -1;

  /**
   * Client user given in the Discord ready event
   */
  public user: APIUser | null = null;

  private readonly _shardOptions: Partial<WebsocketConnectionOptions>;

  private _fetchGatewayCache?: RESTGetAPIGatewayBotResult;

  /**
   * @param auth The Discord token for your bot
   * @param shardCount How many shards to spawn, leave "auto" for Discord recommended count
   * @param _shardOptions Options to pass into each Websocket Shard
   */
  public constructor(
    public readonly auth: string,
    options: Partial<ClusterOptions> = {}
  ) {
    super();

    const {
      wsTotalShardCount = 'auto',
      shardCount = wsTotalShardCount,
      clusterId = 0,
      ...shardOptions
    } = options;

    this.wsTotalShardCount = wsTotalShardCount;
    this.shardCount = shardCount;
    this.clusterId = clusterId;
    this._shardOptions = shardOptions;
  }

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
   * Gets the the given guild is under
   * @param guild The guild id associated with the shard you want to obtain
   */
  public getShard(guild: string) {
    return this.shards.find(s => s.guilds.has(guild));
  }

  /**
   * Broadcasts a payload to every single shard
   */
  public async broadcast(payload: GatewaySendPayload) {
    for (const shard of this.shards) await shard.send(payload, false);
  }

  public async fetchGateway() {
    if (this._fetchGatewayCache) return this._fetchGatewayCache;

    const headers = new Headers();
    headers.set('Authorization', `Bot ${this.auth}`);
    headers.set('User-Agent', `DiscordBot (${CORDIS_META.url}, ${CORDIS_META.version}) Node.js/${process.version}`);

    const res = await fetch(CONSTANTS.gateway, { headers }).catch(() => null);
    const data: RESTGetAPIGatewayBotResult | null = await res?.json().catch(() => null);

    if (!data) throw new CordisGatewayError('fetchGatewayFail');

    this._fetchGatewayCache = data;
    return data;
  }

  /**
   * Spawns all of the shards (if not yet spawned) and connects each one to the gateway
   */
  public async connect() {
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

      if (this.wsTotalShardCount === 'auto') this.wsTotalShardCount = recommendedShards;
      if (this.shardCount === 'auto') this.shardCount = recommendedShards;

      for (let i = 0; i < this.shardCount; i++) {
        this.shards.push(new WebsocketConnection(this, i, url, this._shardOptions));
      }
    }

    for (const shard of this.shards) await shard.connect();
  }

  /**
   * Destroys the cluster and all of the shards
   */
  public async destroy(options: WebsocketConnectionDestroyOptions = { fatal: true }) {
    for (const shard of this.shards) await shard.destroy(options);

    this.user = null;
  }

  private _debug(log: string) {
    this.emit('debug', log, -1);
  }
}

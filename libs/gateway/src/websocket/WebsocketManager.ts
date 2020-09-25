import { EventEmitter } from 'events';
import fetch, { Headers } from 'node-fetch';
import { CordisGatewayError } from '../error';
import { CONSTANTS } from '../util';
import {
  WebsocketShard,
  WebsocketShardStatus,
  WebsocketShardOptions,
  WebsocketShardDestroyOptions
} from './WebsocketShard';
import { User, DispatchEvent } from '@cordis/types';
import { CORDIS_META } from '@cordis/util';
import { stripIndent } from 'common-tags';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Fired when one of the shards opens
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#open
 */
declare function open(id: number): any;

/**
 * Fired when one of the shards begins reconnecting
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#reconnecting
 */
declare function reconnecting(id: number): any;

/**
 * Fired when one of the shards begins disconnecting
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#disconnecting
 */
declare function disconnecting(id: number): any;

/**
 * Provides information useful for debugging
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#debug
 */
declare function debug(info: any, id: number): any;

/**
 * Fired when the gateway gives an error event or when a payload is not successfully sent
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#error
 */
declare function error(info: any, id: number): any;

/**
 * Fired when the manager becomes ready
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#ready
 */
declare function ready(shardOptions: number | 'auto', shards: number): any;

/**
 * Any gateway event after the Shard has become READY
 * @asMemberOf WebsocketManager
 * @event WebsocketManager#dispatch
 */
declare function dispatch(data: DispatchEvent, id: number): any;

/* eslint-enable @typescript-eslint/no-unused-vars */

export interface WebsocketManager {
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
  emit(event: 'dispatch', data: DispatchEvent, id: number): this;
}

/**
 * The entry point for the cordis gateway
 * @noInheritDoc
 */
export class WebsocketManager extends EventEmitter {
  /**
   * An array of all of the WebsocketShards
   */
  public readonly shards: WebsocketShard[] = [];

  /**
   * The last time an identify payload was sent on behalf of this token
   * This is kept due to the fact that Discord wants you to wait 5 seconds in between each one
   */
  public lastIdentify = -1;

  /**
   * Client user given in the Discord ready event
   */
  public user: User | null = null;

  /**
   * @param auth The Discord token for your bot
   * @param shardCount How many shards to spawn, leave "auto" for Discord recommended count
   * @param _shardOptions Options to pass into each Websocket Shard
   */
  public constructor(
    public readonly auth: string,
    public readonly shardCount: number | 'auto' = 'auto',
    private readonly _shardOptions: Partial<WebsocketShardOptions> = {}
  ) {
    super();
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
    return this.shards.every(s => s.status === WebsocketShardStatus.ready);
  }

  /**
   * How many shards were actually spawned (may want to use this if you use Discord recommended amount)
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
   * Spawns all of the shards (if not yet spawned) and connects each one to the gateway
   */
  public async connect() {
    if (!this.shards.length) {
      const headers = new Headers();
      headers.set('Authorization', `Bot ${this.auth}`);
      headers.set('User-Agent', `DiscordBot (${CORDIS_META.url}, ${CORDIS_META.version}) Node.js/${process.version}`);

      const res = await fetch(CONSTANTS.gateway, { headers }).catch(() => null);
      /* eslint-disable @typescript-eslint/naming-convention */
      const data = await res?.json().catch(() => null) as {
        url: string;
        shards: number;
        session_start_limit: {
          total: number;
          remaining: number;
          reset_after: number;
        };
      } | null;

      if (!data) throw new CordisGatewayError('fetchGatewayFail');
      const {
        url,
        shards: recommendedShards,
        session_start_limit: sessionInformation
      } = data;

      this._debug(stripIndent`
        Fetched Gateway Information
          URL: ${url}
          Recommended Shards: ${recommendedShards}
          Session Limit Information
          Total: ${sessionInformation.total}
          Remaining: ${sessionInformation.remaining}
      `);

      const shards = this.shardCount === 'auto' ? recommendedShards : this.shardCount;

      for (let i = 0; i < shards; i++) this.shards.push(new WebsocketShard(this, i, data.url, this._shardOptions));
    }

    for (const shard of this.shards) await shard.connect();
  }

  /**
   * Destroys the manager and all of the shards
   */
  public async destroy(options: WebsocketShardDestroyOptions = { fatal: true }) {
    for (const shard of this.shards) await shard.destroy(options);

    this.user = null;
  }

  private _debug(log: string) {
    this.emit('debug', log, -1);
  }
}

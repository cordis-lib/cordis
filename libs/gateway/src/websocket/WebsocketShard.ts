import WS = require('ws');
import { WebsocketManager } from './WebsocketManager';
import { CordisGatewayError, CordisGatewayTypeError } from '../error';
import * as Util from '../util';
// Need to ensure that the zlib namespace is only being used as a type so it is NOT required in the transpiled javascript
import * as zlib from 'zlib-sync';
import { GatewaySendPayload, GatewayReceivePayload, GatewayDispatchPayload, GatewayOPCodes, GatewayCloseCodes } from 'discord-api-types';
import { AsyncQueue, Intents, INTENTS, IntentKeys, halt } from '@cordis/util';
import { stripIndent } from 'common-tags';

/**
 * The current status of the shard
 */
export enum WebsocketShardStatus {
  /**
   * Not really doing anything
   * Is IDLE either before .connect is called or after .destroy resolves.
   */
  idle,
  /**
   * The shard is currently connecting to the gateway
   */
  connecting,
  /**
   * The connection is currently being terminated
   */
  disconnecting,
  /**
   * Reconnecting to Discord
   */
  reconnecting,
  /**
   * The connnection is open, but the shard itself is not ready
   * (not yet identified, guilds not yet recieved etc)
   */
  open,
  /**
   * Currently waiting for guilds from Discord
   * This status is set when the Ready payload is recieved from Discord
   */
  waiting,
  /**
   * Done waiting for guilds
   */
  ready
}

export interface WebsocketShardOptions {
  /**
   * How long to wait for the WebSocket connection to open before giving up
   */
  openTimeout: number;
  /**
   * How long to wait for Discord's Hello payload before giving up
   */
  helloTimeout: number;
  /**
   * How long to wait for Discord's Resume payload before giving up
   */
  reconnectTimeout: number;
  /**
   * How long to wait for Discord's Ready payload before giving up
   */
  discordReadyTimeout: number;
  /**
   * How long to wait between each GUILD_CREATE packet
   * Once the timeout is hit the shard will simply be marked as ready,
   * concluding that the remaining guilds are in an outage
   */
  guildTimeout: number;
  /**
   * What encoding to use
   * If you have discordapp/erlpack installed it will default to ETF, otherwise, JSON
   */
  encoding: Util.Encoding;
  /**
   * whether or not compression should be used
   * If zlib is not installed but this is set to true a warning will be thrown
   */
  compress: boolean;
  /**
   * Value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list
   * (https://discord.com/developers/docs/topics/gateway#identify-identify-structure)
   */
  largeThreshold: number;
  /**
   * The intents to use
   */
  intents: Intents | IntentKeys | IntentKeys[] | number | bigint;
}

export interface WebsocketShardDestroyOptions {
  /**
   * whether the shard should try to reconnect or not
   */
  reconnect?: boolean;
  /**
   * whether or not this operation was on the user's behalf
   */
  requested?: boolean;
  /**
   * whether or not the error is fatal
   * In this scenario "fatal" means that the session cannot be resumed, meaning the state of the shard should be entirely reset
   */
  fatal?: boolean;
  /**
   * The reason for terminating the connection
   */
  reason?: string;
  /**
   * The exit code
   */
  code?: number;
}

/**
 * Represents a connection to Discord.
 */
export class WebsocketShard implements WebsocketShardOptions {
  public static readonly zlibSuffix = new Uint8Array([0x00, 0x00, 0xff, 0xff]);

  public static readonly infalteOptions = {
    chunkSize: 65535,
    flush: zlib.Z_SYNC_FLUSH
  };

  // Options
  public readonly openTimeout: number;
  public readonly helloTimeout: number;
  public readonly reconnectTimeout: number;
  public readonly discordReadyTimeout: number;
  public readonly guildTimeout: number;
  public readonly encoding: Util.Encoding;
  public readonly compress: boolean;
  public readonly largeThreshold: number;
  public readonly intents: number;

  // State
  public connection?: WS;
  public status = WebsocketShardStatus.idle;

  public inflate: zlib.Inflate | null = null;
  public guilds: Set<string> = new Set();

  private readonly _intervals: { [key: string]: NodeJS.Timeout | null } = {};
  private readonly _timeouts: { [key: string]: NodeJS.Timeout | null } = {};

  private readonly _commandQueue = new AsyncQueue<void>();

  /**
   * Sequence for the last packet recieved, used for resuming
   */
  private _sequence: number | null = null;

  /**
   * Last known session id, used for resuming
   */
  private _sessionId: string | null = null;

  private _pendingGuilds: Set<string> | null = null;

  private _ack = true;
  private _lastAck = 0;

  private _lastBeat = 0;

  private _requests = 0;
  private _firstRequst = -1;

  private _connectResolve: ((value?: any) => void) | null = null;
  private _connectReject: ((reason: any) => void) | null = null;

  private _connectedAt = -1;

  public constructor(
    public readonly manager: WebsocketManager,
    public readonly id: number,
    private readonly _url: string,
    options: Partial<WebsocketShardOptions> = {}
  ) {
    let {
      openTimeout = 60000,
      helloTimeout = 60000,
      reconnectTimeout = 60000,
      discordReadyTimeout = 60000,
      guildTimeout = 10000,
      encoding = Util.defaultEncoding,
      compress = Util.defaultCompress,
      largeThreshold = 250,
      intents = INTENTS.all
    } = options;

    this.openTimeout = openTimeout;
    this.helloTimeout = helloTimeout;
    this.reconnectTimeout = reconnectTimeout;
    this.discordReadyTimeout = discordReadyTimeout;
    this.guildTimeout = guildTimeout;
    this.largeThreshold = largeThreshold;
    if (typeof intents === 'number') intents = BigInt(intents);
    this.intents = new Intents(intents).valueOf(true);

    // If the latter is JSON it means erlpack is not present
    if (encoding === 'etf' && Util.defaultEncoding === 'json') {
      process.emitWarning(new CordisGatewayTypeError('invalidEncoding'));
      encoding = 'json';
    }

    // If the latter is false it means zlib is not present
    if (compress && !Util.defaultCompress) {
      process.emitWarning(new CordisGatewayTypeError('invalidCompression'));
      compress = false;
    }

    this.encoding = encoding;
    this.compress = compress;
    if (compress && Util.zlib?.Inflate) this.inflate = new Util.zlib.Inflate(WebsocketShard.infalteOptions);
  }

  /**
   * How long it took to recieve the heartbeat ACK
   * If it's 0, a value otherwise impossible, it means the shard has not had the chance to obtain the necessary state yet
   */
  public get ping() {
    return this._lastAck - this._lastBeat;
  }

  /**
   * Connects to the gateway; resolves when:
   * a) All guilds are recieved from Discord
   * b) The timeout that waits for guilds is hit & the rest of the pending guilds are deemed unavailable.
   * It should be noted that in either case when this function resolves this shard's status becomes 6 (READY)
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (this.status) {
        case WebsocketShardStatus.connecting:
        case WebsocketShardStatus.disconnecting:
          return reject(new CordisGatewayError('notConnectable', this.id, this.status));
        case WebsocketShardStatus.open:
        case WebsocketShardStatus.waiting:
        case WebsocketShardStatus.ready:
          return resolve(this.destroy({ reason: 'User requested reconnect', reconnect: true }));
        default:
          break;
      }

      this._connectResolve = resolve;
      this._connectReject = reject;

      if (this.status !== WebsocketShardStatus.reconnecting) this.status = WebsocketShardStatus.connecting;
      this.debug(stripIndent`
        [CONNECT]
          Gateway    : ${this._url}
          Version    : 8
          Encoding   : ${this.encoding}
          Compression: ${this.compress ? 'zlib-stream' : 'none'}
      `);
      this._registerTimeout('open', async () => {
        await this.destroy({ reason: 'Gateway did not open in time', fatal: true });
        reject(new CordisGatewayError('timeoutHit', 'open', this.openTimeout));
      }, this.openTimeout);

      this._connectedAt = Date.now();

      this.connection = new WS(`${this._url}?v=8&encoding=${this.encoding}${this.compress ? '&compress=zlib-stream' : ''}`);
      this.connection.onopen = this._onOpen;
      this.connection.onclose = this._onClose;
      this.connection.onerror = ({ error }) => this.manager.emit('error', error, this.id);
      this.connection.onmessage = ({ data }) => this._onMessage(Util.unpack(this.encoding, this._decompress(data)));
    });
  }

  /**
   * Destroys the shard, clearing state as needed, reconnecting if told to, terminating the connection to Discord if still there
   * NOTE: If reconnect is set to true this function will only resolve or reject when connect will
   */
  public async destroy({
    reconnect = false,
    requested = false,
    fatal = false,
    reason,
    code
  }: WebsocketShardDestroyOptions = {}): Promise<void> {
    this.debug(stripIndent`
      [DESTROY]
        reconnect: ${reconnect}
        requested: ${requested}
        fatal    : ${fatal}
        reason   : ${reason}
        code     : ${code}
    `);

    this.manager.emit(reconnect ? 'reconecting' : 'disconnecting', this.id);
    this.status = WebsocketShardStatus.disconnecting;

    if (!reason) {
      if (reconnect) reason = 'Terminating current connection to reconnect.';
      if (requested) reason = 'User requested termination.';
    }

    if (!code) code = Util.normalCloseCode;

    for (const timeout of Object.keys(this._timeouts)) this._clearTimeout(timeout);
    for (const interval of Object.keys(this._intervals)) this._clearInterval(interval);

    if (fatal) {
      this._sequence = null;
      this._sessionId = null;
    }

    this._requests = 0;
    this._firstRequst = -1;
    this._pendingGuilds = null;
    this._ack = true;
    this._lastAck = 0;
    this._lastBeat = 0;

    if (this.connection && [WS.OPEN, WS.CONNECTING].includes(this.connection.readyState)) this.connection.close(code, reason);
    await new Promise(res => {
      this.connection?.on('close', res);
      setTimeout(res, 15000);
    });

    if (this.compress && Util.zlib?.Inflate) this.inflate = new Util.zlib.Inflate(WebsocketShard.infalteOptions);

    this.status = reconnect && !fatal ? WebsocketShardStatus.reconnecting : WebsocketShardStatus.idle;

    if (!reconnect) return;

    return this.connect();
  }

  /**
   * Sends a packet to Discord
   * @param payload The packet to send
   * @param urgent whether or not the packet needs to be put at the top of the queue
   */
  public send(payload: GatewaySendPayload, urgent = false) {
    return this._commandQueue.run(() => this._send(payload), urgent);
  }

  /**
   * Shortcut for emitting a debug event to the parent manager
   * @param log The debug information
   */
  public debug(log: string) {
    this.manager.emit('debug', log, this.id);
  }

  /**
   * Does the actual payload sending
   * @param payload
   */
  private _send(payload: GatewaySendPayload): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise(async (resolve, reject) => {
      if (this._firstRequst === -1 || this._requests === 0) this._firstRequst = Date.now();
      if (this._firstRequst + 6e4 >= Date.now()) this._requests = 0;

      if (++this._requests === 120) {
        const timeSinceFirst = Date.now() - this._firstRequst;
        if (timeSinceFirst < 6e4) await halt(6e4 - timeSinceFirst);
      }

      this.connection!.send(Util.pack(this.encoding, payload), err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  /**
   * Registers an interval
   * @param name Identifier for the interval
   * @param fn The function to call
   * @param time How often to run the interval
   */
  private _registerInterval(name: string, fn: () => any, time: number) {
    this._intervals[name] = setInterval(fn, time);
  }

  /**
   * Registers a timeout
   * @param name Identifier for the timeout
   * @param fn The function to call
   * @param time How often to run the timeout
   */
  private _registerTimeout(name: string, fn: () => any, time: number) {
    this._timeouts[name] = setTimeout(() => {
      fn();
      this._clearTimeout(name);
    }, time);
  }

  /**
   * Refreshes a timeout
   * @param name Identifier for the timeout
   */
  private _refreshTimeout(name: string) {
    const timeout = this._timeouts[name];
    if (!timeout) return;
    timeout.refresh();
  }

  /**
   * Clears an interval
   * @param name The identifier for the interval
   */
  private _clearInterval(name: string) {
    const interval = this._intervals[name];
    if (!interval) return;
    clearInterval(interval);
    this._intervals[name] = null;
  }

  /**
   * Clears a timeout
   * @param name The identifier for the timeout
   */
  private _clearTimeout(name: string) {
    const timeout = this._timeouts[name];
    if (!timeout) return;
    clearTimeout(timeout);
    this._timeouts[name] = null;
  }

  /**
   * Attempts to decompress given packet
   * Errors are sent to {@link WebsocketManager.error}
   * @param data Raw data recieved
   */
  private _decompress(data: any) {
    if (!this.inflate) return data;

    let decompressable: Uint8Array | string;
    if (Array.isArray(data)) decompressable = new Uint8Array(Buffer.concat(data));
    else if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) decompressable = new Uint8Array(data);
    else decompressable = data;

    const suffix = decompressable.slice(decompressable.length - 4, decompressable.length);

    let flush = true;
    for (let i = 0; i < suffix.length; i++) {
      if (suffix[i] !== WebsocketShard.zlibSuffix[i]) {
        flush = false;
        break;
      }
    }

    this.inflate.push(Buffer.from(decompressable), flush ? Util.zlib!.Z_SYNC_FLUSH : Util.zlib!.Z_NO_FLUSH);

    if (this.inflate.err) this.manager.emit('error', `${this.inflate.err}: ${this.inflate.msg}`, this.id);
    if (!flush) return;

    const { result } = this.inflate;
    return Array.isArray(result) ? new Uint8Array(result) : result;
  }

  // Arrow functions are used here to preserve "this" context when passing the function directly

  private readonly _onOpen = () => {
    this._clearTimeout('open');
    this.debug(`[CONNECTED] ${this._url} in ${Date.now() - this._connectedAt}ms`);
    this.debug(`Setting a HELLO timeout for ${this.helloTimeout}ms.`);
    this.manager.emit('open', this.id);
    this._registerTimeout('hello', async () => {
      await this.destroy({ reason: 'Did not recieve hello timeout in time', fatal: true });
      this._connectReject?.(new CordisGatewayError('timeoutHit', 'hello', this.helloTimeout));
    }, this.helloTimeout);

    if (this.status !== WebsocketShardStatus.reconnecting) this.status = WebsocketShardStatus.open;
  };

  private readonly _onClose = async ({ code, reason, wasClean }: { code: number; reason: string; wasClean: boolean }) => {
    const destroy = (options?: WebsocketShardDestroyOptions) => this.destroy(options);

    this.debug(stripIndent`
      [CLOSE]
        Event Code: ${code}
        Clean     : ${wasClean}
        Reason    : ${reason || 'No reason received'}
    `);

    switch (code) {
      case Util.normalCloseCode: break;

      case GatewayCloseCodes.UnknownError: {
        this.debug(`An unknown error occured: ${code} ${reason}`);
        return destroy({ code, reason, reconnect: true });
      }

      case GatewayCloseCodes.UnknownOpCode: {
        this.debug('An invalid opcode was sent to Discord.');
        return destroy({ code, reason, reconnect: true });
      }

      case GatewayCloseCodes.DecodeError: {
        this.debug('An invalid payload was sent to Discord.');
        return destroy({ code, reason, reconnect: true });
      }

      case GatewayCloseCodes.NotAuthenticated: {
        this.debug('A request was somehow sent before the identify payload.');
        return destroy({ code, reason, reconnect: true, fatal: true });
      }

      case GatewayCloseCodes.AuthenticationFailed: {
        await destroy({ code, reason, fatal: true });
        return this._connectReject?.(new CordisGatewayError('tokenInvalid'));
      }

      case GatewayCloseCodes.AlreadyAuthenticated: {
        this.debug('More than one auth payload was sent.');
        return destroy({ code, reason, fatal: true });
      }

      case GatewayCloseCodes.InvalidSeq: {
        this.debug('An invalid sequence was sent.');
        return destroy({ code, reason, reconnect: true, fatal: true });
      }

      case GatewayCloseCodes.RateLimited: {
        this.debug('Somehow hit the rate limit, are you messing with any of the internal methods or state?');
        return destroy({ code, reason, fatal: true });
      }

      case GatewayCloseCodes.SessionTimedOut: {
        this.debug('Session timed out.');
        return destroy({ code, reason, reconnect: true });
      }

      case GatewayCloseCodes.InvalidShard: {
        await destroy({ code, reason, fatal: true });
        return this._connectReject?.(new CordisGatewayError('invalidShard'));
      }

      case GatewayCloseCodes.ShardingRequired: {
        await destroy({ code, reason, reconnect: true });
        return this._connectReject?.(new CordisGatewayError('shardingRequired'));
      }
    }
  };

  private readonly _onMessage = async (packet: GatewayReceivePayload) => {
    switch (packet.op) {
      case GatewayOPCodes.Dispatch: return this._handleDispatch(packet);
      case GatewayOPCodes.Heartbeat: return this._heartbeat(true);
      case GatewayOPCodes.Reconnect:
        return this.destroy({ reason: 'Told to reconnect by Discord', code: Util.restartingCloseCode, reconnect: true });
      case GatewayOPCodes.InvalidSession: {
        this.debug(`Invalid session; should resume: ${packet.d}`);
        return this.destroy({ reason: 'The session has become invalid', reconnect: true, fatal: !packet.d });
      }

      case GatewayOPCodes.Hello: {
        this._clearTimeout('hello');
        this.debug('Clearing HELLO timeout');

        let reconnecting = this.status === WebsocketShardStatus.reconnecting;
        this.debug(`Setting heartbeat interval of ${packet.d.heartbeat_interval}ms`);

        this._registerInterval('heartbeat', () => this._heartbeat(false), packet.d.heartbeat_interval);

        const necessary = this._sequence != null && this._sessionId != null;

        if (reconnecting) {
          this.debug(stripIndent`
            Trying to resume with
              data is present: ${necessary}
              session        : ${this._sessionId}
              sequence       : ${this._sequence}
          `);
        }

        if (reconnecting && necessary) {
          await this.send({
            op: GatewayOPCodes.Resume,
            d: {
              token: this.manager.auth,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              session_id: this._sessionId!,
              seq: this._sequence!
            }
          });
        } else {
          // In case the necessary state wasn't present for reconnecting make sure to properly clean up
          if (reconnecting && !necessary) {
            await this.destroy({ reason: 'Tried to resume but was missing essential state', reconnect: true, fatal: true });
          }

          this.status = WebsocketShardStatus.open;
          reconnecting = false;
          await this._identify();
        }

        if (!reconnecting) {
          this._registerTimeout('discordReady', async () => {
            await this.destroy({ reason: 'Did not recieve the Discord ready payload in time', fatal: true });
            this._connectReject?.(new CordisGatewayError('timeoutHit', 'discordReady', this.discordReadyTimeout));
          }, this.discordReadyTimeout);
        } else {
          this._registerTimeout('reconnecting', async () => {
            await this.destroy({ reason: 'Did not recieve the resume payload in time', fatal: true });
            this._connectReject?.(new CordisGatewayError('timeoutHit', 'reconnecting', this.reconnectTimeout));
          }, this.reconnectTimeout);
        }

        break;
      }

      case GatewayOPCodes.HeartbeatAck: {
        this._ack = true;
        this._lastAck = Date.now();
        this.debug(`Recieved ACK with a latency of ${this.ping}`);
        break;
      }
    }
  };

  private _handleDispatch(payload: GatewayDispatchPayload): void {
    if (this._sequence == null || payload.s > this._sequence) this._sequence = payload.s;

    switch (payload.t) {
      case 'READY': {
        this._clearTimeout('discordReady');

        this.manager.user = payload.d.user;
        this._sessionId = payload.d.session_id;

        if (payload.d.guilds.length) {
          this.status = WebsocketShardStatus.waiting;
          // eslint-disable-next-line no-multi-assign
          this._pendingGuilds = this.guilds = new Set(payload.d.guilds.map(g => g.id));
          this._registerTimeout('guilds', () => {
            this.debug(`${this._pendingGuilds!.size} guilds were never recieved.`);
            this._turnReady();
            this._pendingGuilds = null;
          }, this.guildTimeout);
        } else {
          this.debug('Shard has no guilds, marking as fully ready.');
          this._turnReady();
        }

        break;
      }

      case 'GUILD_CREATE': {
        if (this.status === WebsocketShardStatus.waiting) {
          this._pendingGuilds!.delete(payload.d.id);

          if (!this._pendingGuilds!.size) {
            this.debug('Shard recieved all guilds, marking as fully ready.');
            this._clearTimeout('guilds');
            this._turnReady();
          }

          this._refreshTimeout('guilds');
        } else {
          this.guilds.add(payload.d.id);
        }

        break;
      }

      case 'GUILD_DELETE': {
        if (!payload.d.unavailable) this.guilds.delete(payload.d.id);
        break;
      }

      case 'RESUMED': {
        this._clearTimeout('reconnecting');
        this.debug(`Resumed Session ${this._sessionId}; Replayed ${payload.s - this._sequence} events`);
        this.status = WebsocketShardStatus.ready;
        break;
      }

      default: break;
    }

    this.manager.emit('dispatch', payload, this.id);
  }

  /**
   * Marks the shard as ready, and if applicable the manager
   */
  private _turnReady() {
    this.status = WebsocketShardStatus.ready;
    this._connectResolve?.();
    if (this.manager.ready) this.manager.emit('ready', this.manager.shardCount, this.manager.shardsSpawned);
  }

  private readonly _heartbeat = async (force = false) => {
    if (!this._ack && !force) return this.destroy({ reason: 'Zombie connection', reconnect: true });

    await this.send({ op: GatewayOPCodes.Heartbeat, d: this._sequence }, true);
    this._lastBeat = Date.now();
    this._ack = false;

    this.debug('Heartbeat sent');
  };

  /**
   * Identifies the client to the gateway
   */
  private async _identify() {
    if (this.manager.lastIdentify !== -1) {
      const time = Date.now() - this.manager.lastIdentify;
      if (time < 5000) await halt(5000);
    }

    this.manager.lastIdentify = Date.now();

    this.debug(stripIndent`
      [IDENTIFY] 
        {
          token: [REDACTED],
          properties: {
            $os: ${Util.CONSTANTS.properties.$os};
            $browser: ${Util.CONSTANTS.properties.$browser};
            $device: ${Util.CONSTANTS.properties.$device};
          },
          shard: [${this.id}, ${this.manager.shardsSpawned}],
          large_threshold: ${this.largeThreshold}
          intents: ${this.intents}
        }
    `);

    return this.send({
      op: GatewayOPCodes.Identify,
      d: {
        token: this.manager.auth,
        properties: Util.CONSTANTS.properties,
        shard: [this.id, this.manager.shardsSpawned],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        large_threshold: this.largeThreshold,
        intents: this.intents
      }
    }, true);
  }
}

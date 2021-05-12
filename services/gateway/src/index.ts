import 'reflect-metadata';
import argv from './args';
import { container } from 'tsyringe';
import { createAmqp, RoutingServer, PubSubClient } from '@cordis/brokers';
import { Cluster, IntentKeys } from '@cordis/gateway';
import { DiscordEvents, GatewayServiceConfig, GATEWAY_INJECTION_TOKENS } from '@cordis/common';
import type { GatewaySendPayload } from 'discord-api-types/v8';

export enum Extension {
  preSetup,
  preInit,
  postInit
}

let currentExtension: Extension = Extension.preSetup;

const loadExtension = async () => {
  try {
    switch (currentExtension) {
      case Extension.preSetup: await require('../extensions/pre-setup');
      case Extension.preInit: await require('../extensions/pre-init');
      case Extension.postInit: await require('../extensions/post-init');
    }
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.error(`[${Extension[currentExtension]} EXTENSION ERROR]`, e);
      process.exit(0);
    } else {
      switch (currentExtension) {
        case Extension.preSetup: {
          const config: GatewayServiceConfig = {
            auth: argv.auth,
            amqpHost: argv['amqp-host'],
            debug: argv.debug,
            shardCount: argv['shard-count'],
            startingShard: argv['starting-shard'],
            totalShardCount: argv['total-shard-count'],
            ws: {
              compress: argv['ws-compress'],
              encoding: argv['ws-encoding'],
              timeouts: {
                open: argv['ws-open-timeout'],
                hello: argv['ws-hello-timeout'],
                ready: argv['ws-ready-timeout'],
                guild: argv['ws-guild-timeout'],
                reconnect: argv['ws-reconnect-timeout']
              },
              largeThreshold: argv['ws-large-threshold'],
              intents: argv['ws-intents']
            }
          };

          container.register(GATEWAY_INJECTION_TOKENS.kConfig, { useValue: config });
          break;
        }

        case Extension.preInit: {
          const { channel, connection } = await createAmqp(argv['amqp-host']);
          connection
            .on('error', e => console.error(`[AMQP ERROR]: ${e}`))
            .on('close', () => {
              console.error('[AMQP EXIT]');
              process.exit(1);
            });

          const service = new RoutingServer<keyof DiscordEvents, DiscordEvents>(channel);
          const cluster = new Cluster(
            argv.auth,
            {
              compress: argv['ws-compress'],
              encoding: argv['ws-encoding'] as 'json' | 'etf',
              openTimeout: argv['ws-open-timeout'],
              helloTimeout: argv['ws-hello-timeout'],
              discordReadyTimeout: argv['ws-ready-timeout'],
              guildTimeout: argv['ws-guild-timeout'],
              reconnectTimeout: argv['ws-reconnect-timeout'],
              largeThreshold: argv['ws-large-threshold'],
              intents: argv['ws-intents'] as IntentKeys[],
              shardCount: argv['shard-count'],
              startingShard: argv['starting-shard'],
              totalShardCount: argv['total-shard-count']
            }
          );

          const gatewayCommandsServer = new PubSubClient<GatewaySendPayload>(channel);
          await gatewayCommandsServer.init({
            name: 'gateway_commands',
            fanout: true,
            cb: req => cluster.broadcast(req)
          });

          container.register(GATEWAY_INJECTION_TOKENS.amqp.kChannel, { useValue: channel });
          container.register(GATEWAY_INJECTION_TOKENS.amqp.kConnection, { useValue: connection });
          container.register(GATEWAY_INJECTION_TOKENS.amqp.kService, { useValue: service });
          container.register(GATEWAY_INJECTION_TOKENS.amqp.kCommandsServer, { useValue: gatewayCommandsServer });
          container.register(GATEWAY_INJECTION_TOKENS.kCluster, { useValue: cluster });

          cluster
            .on('disconnecting', id => console.log(`[DISCONNECTING]: Shard id ${id}`))
            .on('reconnecting', id => console.log(`[RECONNECTING]: Shard id ${id}`))
            .on('open', id => console.log(`[CONNECTION OPEN]: Shard id ${id}`))
            .on('error', (err, id) => console.error(`[SHARD ERROR]: Shard id ${id}`, err))
            .on('ready', () => console.log('[READY]: All shards have fully connected'))
            .on('dispatch', data => service.publish(data.t, data.d));

          break;
        }

        case Extension.postInit: {
          break;
        }
      }
    }
  }

  currentExtension++;
};

const main = async () => {
  await loadExtension();
  await loadExtension();

  const service = container.resolve<RoutingServer<keyof DiscordEvents, DiscordEvents>>(GATEWAY_INJECTION_TOKENS.amqp.kService);
  const cluster = container.resolve<Cluster>(GATEWAY_INJECTION_TOKENS.kCluster);

  if (argv.debug) {
    cluster.on('debug', (info, id) => console.log(`[DEBUG]: Shard id ${id}`, info));
  }

  try {
    await service.init({ name: 'gateway', topicBased: false });
    await cluster.connect();

    await loadExtension();
  } catch (e) {
    console.error('Failed to initialize the service or the cluster', e);
    process.exit(1);
  }
};

void main();

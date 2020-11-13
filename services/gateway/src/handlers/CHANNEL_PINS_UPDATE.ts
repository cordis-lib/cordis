import { Patcher, CORDIS_REDIS_SYMBOLS, CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayChannelPinsUpdateDispatch, APIGuild, APIChannel } from 'discord-api-types';
import { Handler } from '../Handler';

const channelPinsUpdate: Handler<GatewayChannelPinsUpdateDispatch['d']> = async (data, service, cache) => {
  const guild = data.guild_id ? await cache.get<APIGuild>(CORDIS_REDIS_SYMBOLS.cache.guilds, data.guild_id) : null;
  const foundChannel = await cache.get<APIChannel>(CORDIS_REDIS_SYMBOLS.cache.channels(data.guild_id), data.channel_id);
  const channel = foundChannel ? Patcher.patchChannel(foundChannel).data : null;

  if ((data.guild_id && !guild) || !data.channel_id) return;

  if (channel) {
    service.publish(
      { guild: guild ?? undefined, channel, lastPinTimestamp: data.last_pin_timestamp },
      CORDIS_AMQP_SYMBOLS.gateway.events.channelPinsUpdate
    );
  }
};

export default channelPinsUpdate;

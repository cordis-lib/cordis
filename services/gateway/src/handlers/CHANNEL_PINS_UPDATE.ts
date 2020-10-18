import { Patcher } from '@cordis/util';
import { GatewayChannelPinsUpdateDispatch, APIGuild } from 'discord-api-types';
import { Handler } from '../Handler';

const channelPinsUpdate: Handler<GatewayChannelPinsUpdateDispatch['d']> = async (data, service, redis) => {
  const rawGuild = data.guild_id ? await redis.hget('guilds', data.guild_id) : null;
  const guild = rawGuild ? JSON.parse(rawGuild) as APIGuild : null;
  const foundChannel = guild
    ? guild.channels?.find(e => e.id === data.channel_id)
    : await redis.hget('dm_channels', data.channel_id);

  const channel = typeof foundChannel === 'string'
    ? Patcher.patchChannel(JSON.parse(foundChannel)).data
    : foundChannel ?? null;

  if ((data.guild_id && !guild) || !data.channel_id) return;

  if (channel) {
    service.publish({ guild: guild ?? undefined, channel: channel, lastPinTimestamp: data.last_pin_timestamp }, 'channelPinsUpdate');
  }
};

export default channelPinsUpdate;

import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayVoiceServerUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const voiceServerUpdate: Handler<GatewayVoiceServerUpdateDispatch['d']> = (data, service) =>
  service.publish(data, CORDIS_AMQP_SYMBOLS.gateway.events.voiceServerUpdate);

export default voiceServerUpdate;

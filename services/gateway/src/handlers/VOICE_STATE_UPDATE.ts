import { CORDIS_AMQP_SYMBOLS } from '@cordis/util';
import { GatewayVoiceStateUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const voiceStateUpdate: Handler<GatewayVoiceStateUpdateDispatch['d']> = (data, service) =>
  service.publish(data, CORDIS_AMQP_SYMBOLS.gateway.events.voiceStateUpdate);

export default voiceStateUpdate;

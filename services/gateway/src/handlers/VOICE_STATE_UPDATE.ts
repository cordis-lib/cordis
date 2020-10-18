import { GatewayVoiceStateUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const voiceStateUpdate: Handler<GatewayVoiceStateUpdateDispatch['d']> = (data, service) => service.publish(data, 'voiceStateUpdate');

export default voiceStateUpdate;

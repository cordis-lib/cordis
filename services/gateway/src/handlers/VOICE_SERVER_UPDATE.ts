import { GatewayVoiceServerUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const voiceServerUpdate: Handler<GatewayVoiceServerUpdateDispatch['d']> = (data, service) => service.publish(data, 'voiceServerUpdate');

export default voiceServerUpdate;

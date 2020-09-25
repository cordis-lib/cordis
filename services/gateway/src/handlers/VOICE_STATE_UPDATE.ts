import { VoiceState } from '@cordis/types';
import { Handler } from '../Handler';

const voiceStateUpdate: Handler<VoiceState> = (data, service) => service.publish(data, 'voiceStateUpdate');

export default voiceStateUpdate;

import { VoiceServerUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const voiceServerUpdate: Handler<VoiceServerUpdateData> = (data, service) => service.publish(data, 'voiceServerUpdate');

export default voiceServerUpdate;


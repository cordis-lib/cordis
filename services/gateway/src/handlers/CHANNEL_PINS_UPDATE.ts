import { ChannelPinsUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const channelPinsUpdate: Handler<ChannelPinsUpdateData> = (data, service) => service.publish(data, 'channelPinsUpdate');

export default channelPinsUpdate;

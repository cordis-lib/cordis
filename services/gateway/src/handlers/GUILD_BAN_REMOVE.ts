import { BanData } from '@cordis/types';
import { Handler } from '../Handler';

const guildBanRemove: Handler<BanData> = (data, service) => service.publish(data, 'guildBanRemove');

export default guildBanRemove;

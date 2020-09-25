import { BanData } from '@cordis/types';
import { Handler } from '../Handler';

const guildBanAdd: Handler<BanData> = (data, service) => service.publish(data, 'guildBanAdd');

export default guildBanAdd;

import { GuildIntegrationsUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const guildIntegrationsUpdate: Handler<GuildIntegrationsUpdateData> = (data, service) => service.publish(data, 'guildIntegrationsUpdate');

export default guildIntegrationsUpdate;

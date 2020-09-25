import { WebhookUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

const webhooksUpdate: Handler<WebhookUpdateData> = (data, service) => service.publish(data, 'webhooksUpdate');

export default webhooksUpdate;

import { GatewayWebhooksUpdateDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const webhooksUpdate: Handler<GatewayWebhooksUpdateDispatch['d']> = (data, service) => service.publish(data, 'webhooksUpdate');

export default webhooksUpdate;

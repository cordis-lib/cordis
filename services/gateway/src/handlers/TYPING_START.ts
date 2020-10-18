import { GatewayTypingStartDispatch } from 'discord-api-types';
import { Handler } from '../Handler';

const typingStart: Handler<GatewayTypingStartDispatch['d']> = (data, service) => service.publish(data, 'typingStart');

export default typingStart;

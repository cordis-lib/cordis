import { TypingStartData } from '@cordis/types';
import { Handler } from '../Handler';

const typingStart: Handler<TypingStartData> = (data, service) => service.publish(data, 'typingStart');

export default typingStart;

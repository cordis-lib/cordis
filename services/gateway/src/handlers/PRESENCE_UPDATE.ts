import { PresenceUpdateData } from '@cordis/types';
import { Handler } from '../Handler';

// ? Don't bother handling cache for presence updates here; it is utterly pointless and clogs up the system heavily
// ? We don't depend on this state. Core supports more customizibility & should the one to handle something that can be easily flipped off
// ? Generally speaking, I think most people will have this intent off, nevertheless
const presenceUpdate: Handler<PresenceUpdateData> = (data, service) => service.publish(data, 'presenceUpdate');

export default presenceUpdate;

import { ReadyData } from '@cordis/types';
import { Handler } from '../Handler';

const ready: Handler<ReadyData> = (data, service, _, __, [, updateUser]) => {
  service.publish(data, 'ready');
  updateUser(data.user);
};

export default ready;

import { User } from '@cordis/types';
import { Handler } from '../Handler';

const userUpdate: Handler<User> = (data, service, _, __, [user, updateUser]) => {
  service.publish({ o: user, n: data }, 'botUserUpdate');
  updateUser(data);
};

export default userUpdate;

import { APIUser } from 'discord-api-types';
import { Handler } from '../Handler';

const userUpdate: Handler<APIUser> = (data, service, _, __, [user, updateUser]) => {
  service.publish({ o: user, n: data }, 'botUserUpdate');
  updateUser(data);
};

export default userUpdate;

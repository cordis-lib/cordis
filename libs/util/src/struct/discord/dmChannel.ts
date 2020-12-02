import { APIChannel } from 'discord-api-types';

export default (n: Partial<APIChannel>, o?: APIChannel | null) => {
  const data = o ?? n;

  const {
    recipients,
    last_message_id, // eslint-disable-line @typescript-eslint/naming-convention
    last_pin_timestamp // eslint-disable-line @typescript-eslint/naming-convention
  } = n;

  if (recipients?.length) data.recipients = recipients;
  if (last_message_id !== undefined) data.last_message_id = last_message_id;
  if (last_pin_timestamp !== undefined) data.last_pin_timestamp = last_pin_timestamp;

  return {
    data: data as APIChannel,
    old: o
  };
};

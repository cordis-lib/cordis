import { APIChannel, ChannelType } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedDMChannel extends RequiredProp<Omit<APIChannel, 'type' | 'recipients'>> {
  type: ChannelType.DM;
}

export default <T extends APIChannel | null | undefined>(n: Partial<APIChannel>, o?: T) => {
  const data = o ?? n;

  const {
    recipients,
    last_message_id, // eslint-disable-line @typescript-eslint/naming-convention
    last_pin_timestamp // eslint-disable-line @typescript-eslint/naming-convention
  } = n;

  data.recipients = recipients ?? data.recipients ?? [];
  data.last_message_id = last_message_id ?? data.last_message_id;
  data.last_pin_timestamp = last_pin_timestamp ?? data.last_pin_timestamp;

  return {
    data: data as PatchedDMChannel,
    old: o as T
  };
};

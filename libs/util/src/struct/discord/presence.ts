import { GatewayPresenceUpdate, PresenceUpdateStatus } from 'discord-api-types';
import { RequiredProp } from '../../types/RequiredProp';

export interface PatchedPresence extends RequiredProp<GatewayPresenceUpdate, 'status' | 'activities'> {}

export default <T extends GatewayPresenceUpdate | null | undefined>(n: Partial<GatewayPresenceUpdate>, o?: T) => {
  const data = o ?? n;

  const {
    status,
    activities
  } = n;

  data.status = status ?? data.status ?? PresenceUpdateStatus.Offline;
  data.activities = activities ?? data.activities ?? [];

  return {
    data: data as PatchedPresence,
    old: o as T
  };
};

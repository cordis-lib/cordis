import { GatewayPresenceUpdate, PresenceUpdateStatus } from 'discord-api-types';

export default (n: Partial<GatewayPresenceUpdate>, o?: GatewayPresenceUpdate | null) => {
  const data = o ?? n;

  const {
    status,
    activities
  } = n;

  data.status = status ?? data.status ?? PresenceUpdateStatus.Offline;
  data.activities = activities ?? data.activities ?? [];

  return {
    data: data as GatewayPresenceUpdate,
    old: o
  };
};

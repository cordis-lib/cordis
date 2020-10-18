import { GatewayPresenceUpdateData, PresenceUpdateStatus } from 'discord-api-types';

export const patch = (n: Partial<GatewayPresenceUpdateData>, o?: GatewayPresenceUpdateData | null) => {
  const data = o ?? n;

  const {
    status,
    activities
  } = n;

  data.status = status ?? data.status ?? PresenceUpdateStatus.Offline;
  data.activities = activities ?? data.activities ?? [];

  return {
    data: data as GatewayPresenceUpdateData,
    old: o
  };
};

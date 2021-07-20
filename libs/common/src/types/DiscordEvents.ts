import type { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/v9';

type SanitizedEvents = {
  [K in GatewayDispatchEvents]: GatewayDispatchPayload & { t: K }
};

export type DiscordEvents = {
  [K in keyof SanitizedEvents]: SanitizedEvents[K]['d']
};

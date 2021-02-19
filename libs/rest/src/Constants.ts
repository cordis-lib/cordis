import { CORDIS_META } from '@cordis/common';

/**
 * UserAgent header
 */
export const USER_AGENT = `DiscordBot (${CORDIS_META.url}, ${CORDIS_META.version}) Node.js/${process.version}` as const;

FROM node:14-alpine
LABEL name "cordis gateway"
LABEL version "0.1.0"
ENV CORDIS_AUTH= \
  CORDIS_AMQP_HOST= \
  CORDIS_DEBUG= \
  CORDIS_SHARD_COUNT= \
  CORDIS_STARTING_SHARD= \
  CORDIS_TOTAL_SHARD_COUNT= \
  CORDIS_REDIS_URL= \
  CORDIS_WS_COMPRESS= \
  CORDIS_WS_ENCODING= \
  CORDIS_WS_OPEN_TIMEOUT= \
  CORDIS_WS_HELLO_TIMEOUT= \
  CORDIS_WS_READY_TIMEOUT= \
  CORDIS_WS_GUILD_TIMEOUT= \
  CORDIS_WS_RECONNECT_TIMEOUT= \
  CORDIS_WS_LARGE_THRESHOLD= \
  CORDIS_WS_INTENTS=

WORKDIR /usr/gateway

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl

RUN curl -L https://unpkg.com/@pnpm/self-installer | node

RUN apk del .build-deps

COPY . .

RUN pnpm i
RUN pnpm run build
RUN pnpm prune --prod

CMD ["node", "dist/index.js", "--enable-source-maps"]

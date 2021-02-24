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
&& apk add --no-cache --virtual .build-deps curl git python3 alpine-sdk

RUN curl -L https://unpkg.com/@pnpm/self-installer | node

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

COPY libs/bitfield/package.json ./libs/bitfield/
COPY libs/brokers/package.json ./libs/brokers/
COPY libs/common/package.json ./libs/common/
COPY libs/error/package.json ./libs/error/
COPY libs/gateway/package.json ./libs/gateway/
COPY libs/queue/package.json ./libs/queue/
COPY libs/redis-store/package.json ./libs/redis-store/
COPY libs/rest/package.json ./libs/rest/
COPY libs/store/package.json ./libs/store/
COPY services/gateway/package.json ./services/gateway/package.json

RUN pnpm i --frozen-lockfile

COPY libs/bitfield ./libs/bitfield
COPY libs/brokers ./libs/brokers
COPY libs/common ./libs/common
COPY libs/error ./libs/error
COPY libs/gateway ./libs/gateway
COPY libs/queue ./libs/queue
COPY libs/redis-store ./libs/redis-store
COPY libs/rest ./libs/rest
COPY libs/store ./libs/store
COPY services/gateway ./services/gateway

RUN pnpm run build && pnpm prune --production

CMD ["node", "--enable-source-maps", "services/gateway/dist/index.js"]

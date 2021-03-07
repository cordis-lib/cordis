FROM node:14-alpine
LABEL name "cordis gateway builder"

WORKDIR /opt/build

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

RUN pnpm i --frozen-lockfile && apk del .build-deps

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

RUN pnpm run build && pnpm prune --prod

FROM node:14-alpine
LABEL name "cordis gateway"
LABEL version "0.1.7"

WORKDIR /usr/gateway

COPY --from=0 /opt/build ./

CMD ["node", "--enable-source-maps", "services/gateway/dist/index.js"]

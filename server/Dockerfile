FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 5000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]

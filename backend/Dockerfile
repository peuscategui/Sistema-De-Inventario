FROM node:18.17-bullseye-slim

RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env .         # <--- Este paso es CLAVE antes de prisma generate

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --production

EXPOSE 3002

CMD ["npm", "run", "start:prod"]

FROM node:18.17-bullseye-slim

RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=inventario \
    DATABASE_URL="postgresql://postgres:postgres@inventario_postgres:5432/inventario" \
    PORT=3002 \
    NODE_ENV=production \
    CORS_ORIGIN="https://tiinventory.efc.com.pe"

COPY package*.json ./
COPY prisma ./prisma/

RUN npm config set registry https://registry.npmjs.org/
RUN npm install --legacy-peer-deps
RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --production

EXPOSE 3002

CMD ["npm", "run", "start:prod"]

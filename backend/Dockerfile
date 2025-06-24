# Usar una imagen base de Node.js más específica y estable
FROM node:18.17-bullseye-slim

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias primero
COPY package*.json ./
COPY prisma ./prisma/

# Configurar npm y instalar dependencias
RUN npm config set registry https://registry.npmjs.org/ \
    && npm install --production=false \
    && npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Exponer el puerto que usa la aplicación
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"] 
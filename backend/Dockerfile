# Usar una imagen base de Node.js
FROM node:18-alpine

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Exponer el puerto que usa la aplicación
EXPOSE 3002

# Comando para ejecutar las migraciones y luego iniciar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"] 
# Usar una imagen base de Node.js más específica
FROM node:18.17-bullseye-slim

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias primero
COPY package*.json ./

# Instalar dependencias con una configuración más específica
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Establecer variables de entorno para la construcción
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NODE_ENV=production

# Compilar la aplicación con manejo de errores
RUN npm run build || (cat /app/.next/error.log && exit 1)

# Exponer el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
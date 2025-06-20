# 🗄️ Configuración de Base de Datos

## Opciones para configurar la base de datos:

### 1. **SQLite (Recomendado para desarrollo)** ⚡
*Más fácil y rápido para empezar*

```bash
# Cambiar en prisma/schema.prisma:
datasource db {
  provider = "sqlite"
  url      = "file:./inventario.db"
}
```

```bash
# En el archivo .env:
DATABASE_URL="file:./inventario.db"
```

### 2. **PostgreSQL Local** 🐘

#### Con Docker:
```bash
docker run --name postgres-inventario \
  -e POSTGRES_DB=inventario_efc \
  -e POSTGRES_USER=usuario \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

#### Instalación local:
- Instalar PostgreSQL
- Crear base de datos: `createdb inventario_efc`
- Usar la URL que ya está en `.env`

### 3. **PostgreSQL en la nube** ☁️
- **Supabase** (gratis): https://supabase.com
- **Neon** (gratis): https://neon.tech  
- **Railway** (gratis): https://railway.app

## ⚡ Comando para aplicar esquema:
```bash
npx prisma db push
```

## 🔄 Comando para migrar datos existentes:
```bash
npm run build
node dist/scripts/migrate-data.js
```
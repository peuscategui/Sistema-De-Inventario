# 🧹 PLAN DE LIMPIEZA Y MIGRACIÓN DE BASE DE DATOS

## 📊 ANÁLISIS ACTUAL

### ✅ TABLAS ESENCIALES (Mantener)
- **`licencia`, `area`, `gerencia`** - Sistema de licencias (nuevo y optimizado)
- **`user`, `resource`, `permission`, `UserPermission`** - Autenticación moderna
- **`inventory`, `clasificacion`** - Sistema de inventario principal

### ⚠️ TABLAS PROBLEMÁTICAS (Requieren migración)
- **`empleado`** - Migrar datos a `user` y eliminar
- **`usuarios`** - Sistema legacy, migrar a `user` y eliminar
- **`tickets`** - No se usa en la aplicación actual, evaluar eliminación

### 🗑️ CAMPOS REDUNDANTES EN `inventory`
- `familia`, `subFamilia`, `tipoEquipo` → Ya están en `clasificacion`
- `cargo`, `gerencia`, `usuarios` → Migrar a relación con `user`
- `precioReposicion` vs `precioReposicion2024` → Consolidar en uno
- `anio` vs `fecha_compra` → Usar solo `fecha_compra`
- `vidaUtil` → Ya está en `clasificacion.vida_util`

## 🚀 PLAN DE MIGRACIÓN

### FASE 1: Backup y Análisis
```bash
cd backend
npx ts-node src/scripts/backup-and-cleanup.ts
```

### FASE 2: Migración de Usuarios
1. **Migrar `usuarios` → `user`**
   - Crear usuarios modernos desde tabla legacy
   - Mantener credenciales y permisos
   
2. **Migrar `empleado` → `user`**
   - Consolidar información de empleados en usuarios
   - Actualizar relaciones en `inventory`

### FASE 3: Limpieza de Inventario
1. **Eliminar campos redundantes**
   - Remover `familia`, `subFamilia`, `tipoEquipo`
   - Remover `cargo`, `gerencia`, `usuarios`
   - Consolidar precios en `precioReposicion`
   
2. **Mejorar relaciones**
   - `inventory.empleadoId` → `inventory.usuarioId`
   - Usar solo relaciones FK, no texto duplicado

### FASE 4: Optimización Final
1. **Eliminar tablas innecesarias**
   - `DROP TABLE empleado`
   - `DROP TABLE usuarios`
   - `DROP TABLE tickets` (si no se usa)

2. **Agregar índices optimizados**
3. **Normalizar nomenclatura** (camelCase consistente)

## 📋 ESTRUCTURA FINAL PROPUESTA

### Tablas Principales:
```
users (consolidado de user + empleado + usuarios)
├── id, username, email, password
├── fullName, cargo, telefono
├── gerenciaId → gerencias.id
└── isActive, isAdmin, timestamps

inventarios (inventory optimizado)
├── id, codigoEFC (unique)
├── marca, modelo, descripcion, serie
├── especificaciones técnicas
├── estado, condicion, ubicacion
├── financiero (fechaCompra, precioCompra, etc.)
├── clasificacionId → clasificaciones.id
├── usuarioId → users.id
└── timestamps

licencias (ya optimizado)
├── id, codigoLicencia (unique)
├── información de licencia
├── areaId → areas.id
├── gerenciaId → gerencias.id
└── timestamps

clasificaciones (clasificacion optimizado)
├── id, familia, subFamilia, tipoEquipo
├── vidaUtil, valorReposicion
├── codigo (unique), activo
└── timestamps

gerencias, areas (ya optimizados)
resources, permissions, user_permissions (ya optimizados)
```

## 🔧 COMANDOS DE MIGRACIÓN

### 1. Ejecutar Análisis
```bash
cd backend
npx ts-node src/scripts/backup-and-cleanup.ts
```

### 2. Aplicar Schema Optimizado
```bash
# Crear nueva migración
npx prisma migrate dev --name "optimize-database-structure"

# Aplicar cambios
npx prisma db push
```

### 3. Ejecutar Scripts de Migración
```bash
# Migrar usuarios
npx ts-node src/scripts/migrate-users.ts

# Migrar inventario
npx ts-node src/scripts/migrate-inventory.ts

# Limpieza final
npx ts-node src/scripts/final-cleanup.ts
```

## ⚡ BENEFICIOS ESPERADOS

### Performance
- 📈 **Menos tablas** (8 → 6 principales)
- 📈 **Menos campos redundantes** en inventory (25 → 18 campos)
- 📈 **Mejores índices** para consultas frecuentes

### Mantenibilidad
- 🔧 **Nomenclatura consistente** (camelCase)
- 🔧 **Relaciones claras** (FK en lugar de texto duplicado)
- 🔧 **Auditoría completa** (timestamps en todas las tablas)

### Funcionalidad
- ✨ **Sistema de usuarios unificado**
- ✨ **Gestión organizacional completa** (gerencias → areas → usuarios)
- ✨ **Licencias totalmente integradas**

## ⚠️ CONSIDERACIONES

1. **Backup obligatorio** antes de cualquier cambio
2. **Downtime planificado** para la migración
3. **Testing exhaustivo** después de cada fase
4. **Rollback plan** en caso de problemas

## 📅 CRONOGRAMA SUGERIDO

- **Día 1**: Backup y análisis
- **Día 2**: Migración de usuarios
- **Día 3**: Optimización de inventario
- **Día 4**: Limpieza final y testing
- **Día 5**: Despliegue y verificación 
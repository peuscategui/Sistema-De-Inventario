# 🔧 Plan de Limpieza de la Estructura Inventory

## 🚨 **Problema Identificado**

Análisis realizado: **17 registros con 30+ inconsistencias** entre datos duplicados en la tabla `inventory` y las tablas `clasificacion` y `empleado`.

### ❌ **Campos Duplicados Problemáticos:**
```
inventory.familia          ≠ clasificacion.familia
inventory.subFamilia       ≠ clasificacion.sub_familia  
inventory.tipoEquipo       ≠ clasificacion.tipo_equipo
inventory.vidaUtil         ≠ clasificacion.vida_util
inventory.usuarios         ≠ empleado.nombre
inventory.cargo            ≠ empleado.cargo
inventory.gerencia         ≠ empleado.gerencia
```

## 🎯 **Solución: Estructura Normalizada**

### ✅ **Mantener en `inventory`:**
- **Información única del equipo**: codigoEFC, marca, modelo, serie, procesador, ram, etc.
- **Estado físico**: status, sedeActual, estado, ubicacionEquipo, condicion
- **Info administrativa**: repotenciadas, motivoCompra, observaciones
- **Info financiera**: precios, proveedor, factura, fechas
- **Relaciones**: clasificacionId, empleadoId

### ❌ **Eliminar de `inventory` (usar relaciones):**
- ~~familia, subFamilia, tipoEquipo, vidaUtil~~ → usar `clasificacion`
- ~~usuarios, cargo, gerencia, sede~~ → usar `empleado`

## 📋 **Pasos de Implementación**

### **Paso 1: Preparación** ✅ HECHO
- [x] Crear backup de datos existentes
- [x] Analizar inconsistencias 
- [x] Crear schema limpio (`schema-clean.prisma`)
- [x] Crear script de importación optimizado

### **Paso 2: Aplicar Nuevo Schema**
```bash
# Respaldar schema actual
cp prisma/schema.prisma prisma/schema-backup.prisma

# Aplicar schema limpio
cp prisma/schema-clean.prisma prisma/schema.prisma

# Aplicar cambios a la base de datos
npx prisma db push
```

### **Paso 3: Actualizar Scripts y Frontend**
- [x] Script de importación optimizado
- [ ] Actualizar servicios del backend
- [ ] Actualizar componentes del frontend
- [ ] Actualizar consultas para usar JOIN

### **Paso 4: Migrar Datos Existentes**
```bash
# Opción A: Limpiar y reimportar con template optimizado
npx ts-node src/scripts/import-inventory-optimizado.ts ../template_inventory_optimizado.csv

# Opción B: Mantener datos actuales (solo relaciones válidas)
# Los datos inconsistentes se ignorarán automáticamente
```

## 🔧 **Cambios en el Frontend**

### **Antes (duplicado):**
```typescript
// ❌ Datos duplicados
inventory.familia        // Duplicado
inventory.tipoEquipo     // Duplicado  
inventory.usuarios       // Duplicado
```

### **Después (normalizado):**
```typescript
// ✅ Usando relaciones
inventory.clasificacion?.familia
inventory.clasificacion?.tipo_equipo
inventory.empleado?.nombre
```

## 📊 **Nuevo Template CSV Optimizado**

**Campos requeridos** (29 columnas vs 37 anteriores):
```csv
codigoEFC,marca,modelo,descripcion,serie,procesador,anio,ram,discoDuro,sistemaOperativo,status,sedeActual,estado,ubicacionEquipo,condicion,repotenciadas,clasificacionObsolescencia,clasificacionRepotenciadas,motivoCompra,precioReposicion,proveedor,factura,anioCompra,precioReposicion2024,fecha_compra,precioUnitarioSinIgv,observaciones,clasificacionId,empleadoId
```

## 🚀 **Ventajas de la Estructura Limpia**

1. **✅ Consistencia**: Un solo lugar para cada dato
2. **✅ Eficiencia**: Menos espacio, mejor performance  
3. **✅ Mantenimiento**: Cambios centralizados
4. **✅ Integridad**: Foreign keys garantizan consistencia
5. **✅ Escalabilidad**: Fácil agregar nuevos campos

## ⚠️ **Consideraciones Importantes**

### **sedeActual vs empleado.sede**
- `sedeActual`: Donde está físicamente el equipo
- `empleado.sede`: Donde trabaja el empleado
- **Pueden ser diferentes** (ej: equipo prestado temporalmente)

### **Datos sin relaciones**
- Equipos sin asignar: `empleadoId = null`
- Equipos sin clasificar: `clasificacionId = null`
- **Ambos son válidos**

## 🎯 **Próximo Paso**

¿Quieres que proceda con aplicar el schema limpio?

```bash
# Comando para aplicar
npx prisma db push
```

**Ventajas inmediatas:**
- Eliminación de 8 campos duplicados
- Consistencia garantizada por FK
- Base para frontend optimizado
- Template CSV más simple (29 vs 37 columnas) 
# 📊 GUÍA PARA CARGAR DATA REAL - ESQUEMA LIMPIO

## 🎯 **¡IMPORTANTE! - CAMBIOS REALIZADOS**

✅ **Esquema limpio aplicado exitosamente**
- ❌ **Eliminados 8 campos duplicados** del modelo `inventory`
- ❌ **Eliminados 2 campos de precios** duplicados (`precioReposicion`, `precioReposicion2024`)
- ✅ **Agregado campo `status`** para estado del equipo
- ✅ **Relaciones obligatorias** establecidas
- ✅ **Integridad de datos** mejorada

### **Campos eliminados de inventory:**
- ~~`familia`~~ → Ahora se obtiene via `item.clasificacion.familia`
- ~~`subFamilia`~~ → Ahora se obtiene via `item.clasificacion.sub_familia`  
- ~~`tipoEquipo`~~ → Ahora se obtiene via `item.clasificacion.tipo_equipo`
- ~~`vidaUtil`~~ → Ahora se obtiene via `item.clasificacion.vida_util`
- ~~`usuarios`~~ → Ahora se obtiene via `item.empleado.nombre`
- ~~`cargo`~~ → Ahora se obtiene via `item.empleado.cargo`
- ~~`gerencia`~~ → Ahora se obtiene via `item.empleado.gerencia`
- ~~`sede`~~ → Ahora se obtiene via `item.empleado.sede`
- ~~`precioReposicion`~~ → Ahora se obtiene via `item.clasificacion.valor_reposicion`
- ~~`precioReposicion2024`~~ → Ahora se obtiene via `item.clasificacion.valor_reposicion`

---

## 📋 **ARCHIVOS CSV CREADOS**

Hemos creado 3 templates CSV que debes llenar con tu data real:

### 1. **`template_clasificaciones.csv`**
**Campos requeridos:**
```
familia,sub_familia,tipo_equipo,vida_util,valor_reposicion
```

**Ejemplos incluidos:**
- Tecnología → Computadoras → Laptop
- Tecnología → Impresoras → Impresora Laser
- Mobiliario → Escritorios → Escritorio Ejecutivo

### 2. **`template_empleados.csv`**
**Campos requeridos:**
```
nombre,cargo,gerencia,sede
```

**Ejemplos incluidos:**
- Juan Pérez, Analista de Sistemas, Tecnología, Surquillo
- María García, Supervisor de Operaciones, Administración, Chorrillos

### 3. **`template_inventory_limpio.csv`**
**Campos requeridos (27 campos):**
```
codigoEFC,marca,modelo,descripcion,serie,procesador,anio,ram,discoDuro,sistemaOperativo,status,estado,ubicacionEquipo,qUsuarios,condicion,repotenciadas,clasificacionObsolescencia,clasificacionRepotenciadas,motivoCompra,proveedor,factura,anioCompra,observaciones,fecha_compra,precioUnitarioSinIgv,tipo_equipo_ref,empleado_ref
```

**⚠️ IMPORTANTE - Campos especiales:**
- `status` → Estado del equipo: "libre", "asignado", "en_reparacion", "dado_de_baja", etc.
- `observaciones` → Comentarios adicionales sobre el equipo
- `fecha_compra` → Fecha de compra en formato YYYY-MM-DD
- `precioUnitarioSinIgv` → Precio sin IGV al momento de compra
- `tipo_equipo_ref` → Debe coincidir exactamente con `tipo_equipo` en clasificaciones
- `empleado_ref` → Debe coincidir exactamente con `nombre` en empleados

---

## 🔄 **FLUJO DE TRABAJO RECOMENDADO**

### **Opción A: Carga masiva completa**
1. **Preparar CSVs completos** con todos tus datos
2. **Ejecutar importación masiva**:
```bash
node import-data-real.js
```

### **Opción B: Carga incremental (recomendado)**
1. **Cargar clasificaciones primero**:
```bash
node gestionar-clasificaciones.js cargar template_clasificaciones.csv
node gestionar-clasificaciones.js listar  # Ver IDs asignados
```

2. **Cargar empleados después**:
```bash
node gestionar-empleados.js cargar template_empleados.csv  
node gestionar-empleados.js listar  # Ver IDs asignados
```

3. **Preparar inventory con referencias correctas**:
   - Usar los `tipo_equipo` exactos que aparecen en el listado
   - Usar los `nombre` exactos que aparecen en el listado

4. **Cargar inventory final**:
```bash
node import-data-real.js  # Solo cargará inventory (clasificaciones y empleados ya existen)
```

### **Paso adicional: Gestión continua**
- **Agregar clasificaciones nuevas**: `gestionar-clasificaciones.js agregar`
- **Buscar empleados**: `gestionar-empleados.js buscar`
- **Actualizar datos**: `gestionar-empleados.js actualizar`

---

## 🛠️ **SCRIPTS DE GESTIÓN**

### **Scripts disponibles:**

#### **1. Script principal de importación (import-data-real.js)**
```bash
node import-data-real.js
```
Carga automáticamente:
1. ✅ Clasificaciones primero
2. ✅ Empleados después  
3. ✅ Inventory al final (con relaciones)
4. ✅ Valida que las referencias existan
5. ✅ Muestra estadísticas de importación

#### **2. Gestión de clasificaciones (gestionar-clasificaciones.js)**
```bash
# Ver todas las clasificaciones con sus IDs
node gestionar-clasificaciones.js listar

# Cargar desde CSV
node gestionar-clasificaciones.js cargar template_clasificaciones.csv

# Buscar clasificaciones
node gestionar-clasificaciones.js buscar laptop

# Agregar una clasificación individual
node gestionar-clasificaciones.js agregar "Servidor" "Rack" "Servidor Dell" "7 años" 8000
```

#### **3. Gestión de empleados (gestionar-empleados.js)**
```bash
# Ver todos los empleados con sus IDs
node gestionar-empleados.js listar

# Cargar desde CSV
node gestionar-empleados.js cargar template_empleados.csv

# Buscar empleados
node gestionar-empleados.js buscar juan

# Agregar un empleado individual
node gestionar-empleados.js agregar "María García" "Jefe de Área" "Finanzas" "Chorrillos"

# Actualizar empleado existente
node gestionar-empleados.js actualizar 15 "María Elena García"

# Ver empleados por gerencia
node gestionar-empleados.js gerencia sistemas
```

---

## 📊 **VENTAJAS DEL ESQUEMA LIMPIO**

### **✅ Eliminación de duplicación:**
- **Antes:** `inventory.tipoEquipo` + `clasificacion.tipo_equipo` (duplicado)
- **Ahora:** Solo `item.clasificacion.tipo_equipo` (única fuente)
- **Antes:** `inventory.precioReposicion` duplicado de `clasificacion.valor_reposicion`
- **Ahora:** Solo `item.clasificacion.valor_reposicion` (única fuente)

### **✅ Integridad de datos:**
- **Antes:** Inconsistencias entre campos duplicados
- **Ahora:** Foreign keys garantizan consistencia

### **✅ Eficiencia:**
- **Antes:** 37 campos en inventory  
- **Ahora:** 27 campos en inventory (-8 duplicados, -2 precios duplicados, +3 campos completos)

### **✅ Mantenimiento:**
- **Antes:** Actualizar datos en múltiples lugares
- **Ahora:** Single source of truth

---

## 🚀 **PRÓXIMOS PASOS**

1. **Llena los templates CSV** con tu data real
2. **Ejecuta el script de importación**
3. **Verifica los datos** en el frontend
4. **¡Disfruta del sistema optimizado!**

---

## 🆘 **¿NECESITAS AYUDA?**

Si tienes problemas:
1. Verifica que los nombres en las referencias coincidan exactamente
2. Revisa que no haya caracteres especiales en los CSV
3. Asegúrate de que los archivos estén en la carpeta correcta
4. Consulta los logs de error del script

**¡El esquema limpio te va a ahorrar mucho trabajo a largo plazo!** 🎉 
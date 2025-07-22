# Formato para Carga de Inventario

## Estructura de la tabla `inventory`

La tabla inventory contiene todos los equipos y dispositivos de la empresa con sus especificaciones técnicas y asignaciones.

## Formato del archivo CSV

### Estructura requerida:
```csv
codigoEFC,marca,modelo,descripcion,serie,procesador,anio,ram,discoDuro,sistemaOperativo,status,estado,ubicacionEquipo,qUsuarios,condicion,repotenciadas,clasificacionObsolescencia,clasificacionRepotenciadas,motivoCompra,proveedor,factura,anioCompra,observaciones,fecha_compra,precioUnitarioSinIgv,clasificacionId,empleadoId
```

## Descripción de campos:

### 🔑 **Campos de Identificación**
- **codigoEFC** (String): Código único del equipo (ej: EFC-LT-001, EFC-DS-002)
- **marca** (String): Marca del equipo (HP, Dell, Lenovo, etc.)
- **modelo** (String): Modelo específico (EliteBook 850 G7, OptiPlex 3080, etc.)
- **serie** (String): Número de serie del fabricante

### 📋 **Información Técnica**
- **descripcion** (String): Descripción detallada del equipo
- **procesador** (String): Tipo de procesador (Intel i5-10400, Intel i7-10510U, etc.)
  - Para equipos sin procesador: usar "N/A"
- **anio** (Integer): Año de fabricación (2020, 2021, 2022, etc.)
- **ram** (String): Memoria RAM (8GB, 16GB, 32GB, o "N/A")
- **discoDuro** (String): Almacenamiento (256GB SSD, 1TB HDD, etc., o "N/A")
- **sistemaOperativo** (String): SO instalado (Windows 11 Pro, Ubuntu 20.04, etc., o "N/A")

### 📍 **Estado y Ubicación**
- **status** (String): Estado de asignación
  - `libre` - Disponible para asignación
  - `asignado` - Asignado a empleado
  - `operativo` - En uso operacional (servidores, infraestructura)
  - `mantenimiento` - En reparación
  - `baja` - Dado de baja
  
- **estado** (String): Condición física
  - `Operativo` - Funcionando correctamente
  - `Averiado` - Con fallas
  - `Obsoleto` - Tecnológicamente obsoleto

- **ubicacionEquipo** (String): Ubicación física específica
  - Ejemplos: "Oficina Contabilidad", "Mesa Sistemas 12", "Rack Principal"

- **qUsuarios** (Integer): Cantidad de usuarios que usan el equipo
  - 0 = Sin asignar
  - 1 = Uso individual  
  - >1 = Uso compartido

### 🔧 **Condición y Mantenimiento**
- **condicion** (String): Estado general
  - `Excelente` - Como nuevo
  - `Bueno` - Buen estado
  - `Regular` - Estado aceptable
  - `Malo` - Requiere atención

- **repotenciadas** (Boolean): Si el equipo fue repotenciado
  - `TRUE` - Ha sido mejorado/actualizado
  - `FALSE` - Estado original

- **clasificacionObsolescencia** (String): Nivel de obsolescencia
  - `Normal` - Tecnología actual
  - `Pronta` - Cerca de ser obsoleto
  - `Obsoleto` - Tecnología antigua

- **clasificacionRepotenciadas** (String): Tipo de repotenciación realizada
  - Usar "N/A" si no aplica

### 💰 **Información Comercial**
- **motivoCompra** (String): Razón de la adquisición
  - Ejemplos: "Renovación tecnológica", "Ampliación de equipo", "Reemplazo"

- **proveedor** (String): Empresa proveedora
- **factura** (String): Número de factura
- **anioCompra** (Integer): Año de compra
- **precioUnitarioSinIgv** (Decimal): Precio sin IGV (formato: 2800.00)
- **fecha_compra** (Date): Fecha de compra (formato: YYYY-MM-DD)

### 📝 **Observaciones**
- **observaciones** (String): Comentarios adicionales

### 🔗 **Relaciones (IMPORTANTES)**
- **clasificacionId** (Integer): ID de la clasificación (tabla clasificacion)
  - Debe existir en la tabla clasificaciones cargada previamente
  - IDs válidos: 1-38 según tus clasificaciones
  - Ejemplos:
    - 6 = Laptop Estándar
    - 2 = Desktop SFF  
    - 8 = Tablets
    - 14 = Impresora Láser

- **empleadoId** (Integer): ID del empleado asignado (tabla empleado)
  - Debe existir en la tabla empleados cargada previamente
  - IDs válidos: 1-439 según tus empleados
  - **Dejar VACÍO** para equipos sin asignar (servidores, impresoras compartidas, etc.)

## ⚠️ **Reglas Importantes:**

1. **NO incluir datos de empleado directamente** - solo usar empleadoId
2. **NO incluir datos de clasificación directamente** - solo usar clasificacionId  
3. **Fechas** en formato ISO: YYYY-MM-DD
4. **Precios** con punto decimal: 2800.00
5. **Valores boolean**: TRUE/FALSE (mayúsculas)
6. **Campos vacíos**: usar "N/A" para texto, dejar vacío para números opcionales

## 📊 **Ejemplos de clasificacionId comunes:**
- **1-7**: Computadoras (Desktop, Laptop, Todo-en-uno)
- **8-9**: Tablets  
- **10-12**: Servidores
- **13-17**: Redes (Switch, Hub, Access Points)
- **18-24**: Impresoras
- **25-27**: Protección Eléctrica (UPS)
- **28-38**: Colaboración y Comunicaciones

## 📁 **Archivo generado:**
- `template_inventory_limpio.csv` - Template con ejemplos
- Para agregar más items, copiar la estructura y completar los datos

✅ **El sistema validará que clasificacionId y empleadoId existan en sus respectivas tablas** 
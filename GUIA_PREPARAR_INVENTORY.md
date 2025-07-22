# 📊 Guía Completa: Preparar Datos de Inventory

## 🚀 ¡Ya tienes 17 equipos de ejemplo importados!

## 📝 **Paso 1: Obtener IDs de Referencia**

### 🔍 Para obtener IDs de clasificaciones disponibles:
```sql
-- Ejecutar en tu base de datos o crear un script
SELECT id, familia, sub_familia, tipo_equipo 
FROM clasificacion 
ORDER BY id;
```

### 👥 Para obtener IDs de empleados:
```sql
-- Buscar empleados por nombre
SELECT id, nombre, cargo, gerencia, sede 
FROM empleado 
WHERE nombre LIKE '%nombrequebuscas%'
ORDER BY id;
```

## 📊 **Paso 2: Preparar tu archivo CSV**

### Copia el archivo `inventory_ejemplo_realista.csv` y modifica:

1. **Abre en Excel/Google Sheets**
2. **Reemplaza los datos de ejemplo con tus datos reales**
3. **Mantén el formato exacto de las columnas**

## 🔧 **Paso 3: Tipos de Equipos Comunes**

Basándote en el ejemplo, estos son los tipos más comunes:

### 💻 **Computadoras:**
- **Laptops**: `Laptop, Computadoras, Laptop`
- **Desktops**: `Desktop, Computadoras, Desktop`
- **Tablets**: `Tablet, Computadoras, Tablet`

### 🖥️ **Periféricos:**
- **Monitores**: `Monitor, Periféricos, Monitor`
- **Impresoras**: `Impresora, Periféricos, Impresora`
- **Teclados**: `Teclado, Periféricos, Teclado`
- **Mouse**: `Mouse, Periféricos, Mouse`
- **Cámaras**: `Cámara Web, Periféricos, Cámara`

### 🖥️ **Infraestructura:**
- **Servidores**: `Servidor, Servidores, Servidor Torre`
- **Switches**: `Switch, Redes, Switch`
- **UPS**: `UPS, Energía, UPS`

## 📋 **Paso 4: Campos Importantes**

### 🔑 **Campos Obligatorios:**
- `codigoEFC`: Código único (ej: EFC-LT-001, EFC-DS-001)
- Todos los demás campos son opcionales

### 💰 **Campos Numéricos:**
- `anio`: 2018, 2019, 2020, etc.
- `precioReposicion`: 1200.50 (con punto decimal)
- `qUsuarios`: 1, 2, 3, etc.
- `clasificacionId`: 1-38 (opcional, usar si conoces el ID)
- `empleadoId`: 1-486 (opcional, usar si conoces el ID)

### 📅 **Fechas:**
- `fecha_compra`: 2020-03-15 (formato YYYY-MM-DD)

### ✅ **Booleanos:**
- `repotenciadas`: TRUE o FALSE (mayúsculas)

### 📍 **Sedes disponibles:**
- Surquillo
- Chorrillos

## 🎯 **Paso 5: Estrategias de Llenado**

### 🔄 **Opción A: Sin relaciones (más simple)**
Deja vacías las columnas `clasificacionId` y `empleadoId`:
```csv
EFC-001,Laptop,Computadoras,Laptop,HP,EliteBook,,,Intel i5,2020,8GB,256GB,Windows 11,libre,Surquillo,Operativo,,,,,1,Bueno,FALSE,Normal,N/A,Compra,1200.00,,,2020,1400.00,,4 años,2020-03-15,1200.00,,
```

### 🔗 **Opción B: Con relaciones (más completo)**
Incluye IDs de clasificación y empleado:
```csv
EFC-001,Laptop,Computadoras,Laptop,HP,EliteBook,,,Intel i5,2020,8GB,256GB,Windows 11,asignado,Surquillo,Operativo,Juan Pérez,Analista,TI,,1,Bueno,FALSE,Normal,N/A,Compra,1200.00,,,2020,1400.00,,4 años,2020-03-15,1200.00,1,123
```

## 🚀 **Paso 6: Importar tus Datos**

Una vez que tengas tu archivo listo:

```bash
# Desde la carpeta backend
npx ts-node src/scripts/import-inventory-csv.ts ../mi_inventario.csv
```

## ⚠️ **Consejos Importantes:**

1. **Códigos únicos**: Usa un sistema como EFC-LT-001, EFC-DS-002, etc.
2. **Backup**: Siempre haz backup antes de importar datos masivos
3. **Prueba pequeña**: Importa 5-10 registros primero
4. **Validación**: El script validará automáticamente las relaciones

## 🔍 **Verificar Importación:**

```bash
# Ver cuántos registros tienes
npx ts-node -e "
import { PrismaService } from './src/prisma.service';
const prisma = new PrismaService();
prisma.inventory.count().then(count => {
  console.log('Total inventory:', count);
  prisma.$disconnect();
});
"
```

## 📞 **¿Necesitas ayuda?**

Si tienes un archivo Excel con tu inventario actual, compártelo y te ayudo a convertirlo al formato correcto.

**¡Ya tienes todo listo para cargar tu inventario completo!** 🎉 
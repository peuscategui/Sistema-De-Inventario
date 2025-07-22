# Formato para Carga de Clasificaciones

## Estructura de la tabla `clasificacion`

La tabla clasificaciones tiene la siguiente estructura según el esquema de Prisma:

```prisma
model clasificacion {
  id               Int         @id @default(autoincrement())
  familia          String?     @db.VarChar(100)
  sub_familia      String?     @db.VarChar(100)
  tipo_equipo      String?     @db.VarChar(100)
  vida_util        String?     @db.VarChar(50)
  valor_reposicion Decimal?    @db.Decimal(10, 2)
  inventarios      inventory[]
}
```

## Formato del archivo CSV

### Estructura requerida:
```csv
id,familia,sub_familia,tipo_equipo,vida_util,valor_reposicion
```

### Descripción de campos:

1. **id** (Int): Identificador único de la clasificación
   - Tipo: Número entero
   - Requerido para carga con IDs específicos
   - Ejemplo: 1, 2, 3, etc.

2. **familia** (String, max 100 caracteres): Familia del equipo
   - Ejemplos: "Computadora", "Impresora", "Servidor", "Redes"

3. **sub_familia** (String, max 100 caracteres): Subfamilia del equipo
   - Ejemplos: "Desktop", "Laptop", "Switch", "Router"

4. **tipo_equipo** (String, max 100 caracteres): Tipo específico de equipo
   - Ejemplos: "Laptop Estándar", "Desktop SFF", "Switch Core"

5. **vida_util** (String, max 50 caracteres): Vida útil del equipo
   - Formato recomendado: "X años"
   - Ejemplos: "3 años", "5 años", "7 años"

6. **valor_reposicion** (Decimal): Valor de reposición en soles
   - Formato: Número decimal con hasta 2 decimales
   - Ejemplos: 500.00, 1500.50, 10000.00

## Archivos disponibles:

### 📁 `clasificaciones_carga_con_id.csv`
Archivo principal con 38 clasificaciones pre-definidas, listo para cargar en la base de datos desde cero.

### 📁 `template_clasificaciones.csv`
Plantilla vacía para agregar nuevas clasificaciones. Comienza desde el ID 39.

## Notas importantes:

- ✅ **Formato correcto**: Sin columnas duplicadas, headers alineados
- ✅ **IDs incluidos**: Permite cargar con IDs específicos para mantener referencias
- ✅ **Valores numéricos**: Los valores de reposición están en formato decimal correcto
- ✅ **Codificación**: UTF-8 compatible con caracteres especiales (ñ, acentos)

## Scripts de carga compatibles:

- `cargar-datos-con-id.js` - Carga las tres tablas principales
- `cargar-solo-clasificaciones.js` - Carga solo clasificaciones
- `backend/gestionar-clasificaciones.js` - Gestión completa de clasificaciones

## Ejemplo de uso:

```csv
id,familia,sub_familia,tipo_equipo,vida_util,valor_reposicion
39,Computadora,Workstation,Workstation Gráfica,5 años,3500.00
40,Red,Firewall,Firewall Corporativo,7 años,5000.00
``` 
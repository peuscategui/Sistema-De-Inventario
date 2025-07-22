# 📊 GUÍA PARA CARGAR DATA CORRECTA

## ✅ **PLANTILLAS CREADAS AUTOMÁTICAMENTE**

Ya tienes las plantillas CSV listas en:
- `backend/data/clasificaciones.csv`
- `backend/data/gerencias.csv`

## 📋 **PASO A PASO**

### **1. CLASIFICACIONES**

**Archivo:** `backend/data/clasificaciones.csv`

**Formato:**
```csv
familia,subFamilia,tipoEquipo,vidaUtil,valorReposicion,codigo
Computadora,Desktop,Torre,5 años,1500.00,COMP-DESK-001
Monitor,LED,24 pulgadas,7 años,300.00,MON-LED-001
```

**Campos:**
- `familia`: Computadora, Monitor, Impresora, Servidor, etc.
- `subFamilia`: Desktop, Laptop, LED, Láser, etc.
- `tipoEquipo`: Torre, Básica, 24 pulgadas, Monocromática, etc.
- `vidaUtil`: "5 años", "7 años" (formato texto)
- `valorReposicion`: Precio numérico (opcional)
- `codigo`: Código único alfanumérico (opcional)

### **2. GERENCIAS Y ÁREAS**

**Archivo:** `backend/data/gerencias.csv`

**Formato:**
```csv
nombre,codigo,descripcion,areas
Gerencia de Tecnología,GER-TEC,Gestión de infraestructura tecnológica,Sistemas|Desarrollo|Soporte Técnico
```

**Campos:**
- `nombre`: Nombre completo de la gerencia
- `codigo`: Código único (ej: GER-TEC, GER-ADM)
- `descripcion`: Descripción opcional
- `areas`: Áreas separadas por `|` (pipe)

**⚠️ IMPORTANTE:** Las áreas se separan con `|` no con comas

## 🚀 **CÓMO EJECUTAR LA CARGA**

### **Paso 1: Editar las plantillas**
```bash
# Abrir y editar clasificaciones
notepad backend/data/clasificaciones.csv

# Abrir y editar gerencias
notepad backend/data/gerencias.csv
```

### **Paso 2: Ejecutar importación**
```bash
# Ir al directorio backend
cd backend

# Importar clasificaciones
npx ts-node src/scripts/import-clasificaciones.ts

# Importar gerencias y áreas
npx ts-node src/scripts/import-gerencias.ts
```

## 📊 **EJEMPLO COMPLETO - CLASIFICACIONES**

```csv
familia,subFamilia,tipoEquipo,vidaUtil,valorReposicion,codigo
Computadora,Desktop,Torre Básica,5 años,1200.00,COMP-DESK-BAS
Computadora,Desktop,Torre Gaming,5 años,2500.00,COMP-DESK-GAM
Computadora,Laptop,Básica,4 años,800.00,COMP-LAP-BAS
Computadora,Laptop,Ejecutiva,4 años,1500.00,COMP-LAP-EJE
Computadora,All-in-One,Estándar,5 años,1800.00,COMP-AIO-STD
Monitor,LED,19 pulgadas,7 años,200.00,MON-LED-19
Monitor,LED,24 pulgadas,7 años,350.00,MON-LED-24
Monitor,LED,27 pulgadas,7 años,500.00,MON-LED-27
Impresora,Láser,Monocromática,6 años,400.00,IMP-LAS-MONO
Impresora,Láser,Color,6 años,800.00,IMP-LAS-COL
Impresora,Inyección,Básica,3 años,150.00,IMP-INY-BAS
Servidor,Rack,1U,10 años,3000.00,SRV-RAC-1U
Servidor,Rack,2U,10 años,5000.00,SRV-RAC-2U
Servidor,Torre,Pequeño,8 años,2000.00,SRV-TOR-PEQ
```

## 📊 **EJEMPLO COMPLETO - GERENCIAS**

```csv
nombre,codigo,descripcion,areas
Gerencia General,GER-GEN,Dirección ejecutiva,Dirección|Secretaria Ejecutiva
Gerencia de Tecnología,GER-TEC,Gestión de infraestructura tecnológica,Sistemas|Desarrollo|Soporte Técnico|Redes
Gerencia de Administración,GER-ADM,Administración y finanzas,Contabilidad|Recursos Humanos|Finanzas|Tesorería
Gerencia Comercial,GER-COM,Ventas y atención al cliente,Ventas|Marketing|Atención al Cliente|Call Center
Gerencia de Operaciones,GER-OPE,Operaciones logísticas,Almacén|Distribución|Inventario|Logística
Gerencia de Proyectos,GER-PRO,Gestión de proyectos,Planificación|Ejecución|Control|PMO
Gerencia Legal,GER-LEG,Asuntos legales y compliance,Contratos|Compliance|Legal|Auditoría
Gerencia de Calidad,GER-CAL,Control y aseguramiento de calidad,QA|QC|Procesos|Certificaciones
```

## ⚠️ **VALIDACIONES AUTOMÁTICAS**

Los scripts incluyen:
- ✅ **Validación de campos obligatorios**
- ✅ **Detección de duplicados**
- ✅ **Actualización de registros existentes**
- ✅ **Creación de códigos automáticos**
- ✅ **Reporte detallado de resultados**

## 🔄 **LIMPIEZA OPCIONAL (SI NECESITAS EMPEZAR DE CERO)**

```bash
# ⚠️ CUIDADO: Esto eliminará TODAS las clasificaciones
# Solo úsalo si no hay inventarios creados
npx ts-node -e "
import('./src/scripts/import-clasificaciones.ts').then(m => m.cleanExistingClasificaciones());
"

# ⚠️ CUIDADO: Esto eliminará TODAS las gerencias y áreas
# Solo úsalo si no hay licencias creadas
npx ts-node -e "
import('./src/scripts/import-gerencias.ts').then(m => m.cleanExistingGerencias());
"
```

## ✅ **FLUJO RECOMENDADO**

1. **Editar plantillas** con tus datos reales
2. **Ejecutar importación** de clasificaciones
3. **Ejecutar importación** de gerencias
4. **Verificar resultados** en la consola
5. **Probar en la aplicación** web

## 🎯 **RESULTADO ESPERADO**

Después de la carga tendrás:
- ✅ **Clasificaciones limpias** con códigos y valores
- ✅ **Gerencias organizadas** con sus áreas
- ✅ **Dropdowns funcionando** en el frontend
- ✅ **Base para inventario** estructurada
- ✅ **Sistema de licencias** con referencias correctas

---

**📞 Si hay errores:** Los scripts muestran detalles específicos de cada problema
**🔄 Actualización:** Puedes re-ejecutar los scripts sin problema 
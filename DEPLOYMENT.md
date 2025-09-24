# 🚀 Guía de Despliegue a Producción

## 📋 Variables de Entorno

### Frontend (Next.js)
Para producción, configurar las siguientes variables de entorno en EasyPanel:

```bash
# Backend API URL - OBLIGATORIO para producción
NEXT_PUBLIC_API_URL=https://tiinventory.efc.com.pe

# Configuración de entorno
NODE_ENV=production
```

### Backend (NestJS)
Las variables de entorno del backend ya están configuradas correctamente.

## 🔧 Configuración Automática

El sistema ahora detecta automáticamente el entorno:

### Desarrollo Local
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3002`

### Producción
- **Frontend**: `https://pc.tiinventory.efc.com.pe`
- **Backend**: `https://tiinventory.efc.com.pe`

## 📝 Pasos para Despliegue

1. **Subir código a GitHub** ✅ (Ya completado)

2. **Configurar variables de entorno en EasyPanel**:
   ```bash
   NEXT_PUBLIC_API_URL=https://tiinventory.efc.com.pe
   NODE_ENV=production
   ```

3. **Redesplegar en EasyPanel**:
   - Frontend: Usar la rama `feature/rbac-permissions-ui`
   - Backend: Usar la rama `feature/rbac-permissions-ui`

4. **Verificar funcionamiento**:
   - Verificar que las tarjetas del dashboard redirijan correctamente
   - Verificar que los filtros funcionen
   - Verificar que no apunte a localhost

## 🎯 URLs de Producción

- **Frontend**: https://pc.tiinventory.efc.com.pe
- **Backend**: https://tiinventory.efc.com.pe
- **Dashboard**: https://pc.tiinventory.efc.com.pe

## ✅ Funcionalidades Implementadas

- ✅ Tarjetas clickeables en dashboard
- ✅ Filtros por condición (OPERATIVO, OBSOLETO)
- ✅ Filtros por familia (Computadora, etc.)
- ✅ Detección automática de entorno
- ✅ Variables de entorno configuradas
- ✅ CORS configurado para producción

## 🔍 Debugging

Para verificar que las URLs están correctas, revisar la consola del navegador:
```
🔧 Entorno: production
🔧 API_BASE_URL configurada: https://tiinventory.efc.com.pe
🔧 NEXT_PUBLIC_API_URL: https://tiinventory.efc.com.pe
```

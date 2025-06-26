// Configuración de la API
// TEMPORAL: Forzar URL correcta para EasyPanel
const isProduction = process.env.NODE_ENV === 'production';
const productionUrl = 'http://192.168.40.79:3002';
const developmentUrl = 'http://localhost:3002';

export const API_BASE_URL = isProduction ? productionUrl : (process.env.NEXT_PUBLIC_API_URL || developmentUrl);

// Debug: Mostrar la URL que se está usando y todas las variables disponibles
console.log('🔧 DEBUG - isProduction:', isProduction);
console.log('🔧 DEBUG - productionUrl:', productionUrl);
console.log('🔧 DEBUG - developmentUrl:', developmentUrl);
console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 NEXT_PUBLIC_API_URL desde env:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Todas las variables NEXT_PUBLIC_:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log('🔧 window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');

// URLs específicas del API - HARDCODED TEMPORALMENTE
const FORCED_API_URL = 'http://192.168.40.79:3002';
console.log('🚨 FORZANDO URL:', FORCED_API_URL);
console.log('🚨 TODAS LAS LLAMADAS IRAN A:', FORCED_API_URL);

export const API_ENDPOINTS = {
  // Inventario
  inventario: `${FORCED_API_URL}/inventario-relacional`,
  inventarioExport: `${FORCED_API_URL}/inventario-relacional/export`,
  inventarioBatch: `${FORCED_API_URL}/inventario-relacional/batch`,
  
  // Donaciones
  donaciones: `${FORCED_API_URL}/inventario-relacional/donaciones/all`,
  donacionesSearch: `${FORCED_API_URL}/inventario-relacional/donaciones/search`,
  
  // Bajas
  bajas: `${FORCED_API_URL}/inventario-relacional/bajas/all`,
  bajasSearch: `${FORCED_API_URL}/inventario-relacional/bajas/search`,
  
  // Artículos
  inventory: `${FORCED_API_URL}/inventory`,
  inventoryBatch: `${FORCED_API_URL}/inventory/batch`,
  
  // Clasificaciones
  clasificacion: `${FORCED_API_URL}/clasificacion`,
  clasificacionBatch: `${FORCED_API_URL}/clasificacion/batch`,
  
  // Colaboradores
  colaboradores: `${FORCED_API_URL}/colaboradores`,
  colaboradoresBatch: `${FORCED_API_URL}/colaboradores/batch`,
  
  // Dashboard
  dashboard: `${FORCED_API_URL}/dashboard`,
  dashboardDistribucion: `${FORCED_API_URL}/dashboard/distribucion-familia`,
} as const;

// Función helper para construir URLs dinámicas
export const buildApiUrl = (endpoint: string, id?: string | number) => {
  const baseUrl = API_BASE_URL + endpoint;
  return id ? `${baseUrl}/${id}` : baseUrl;
}; 
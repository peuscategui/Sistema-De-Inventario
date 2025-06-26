// Configuración de la API
// Prioridad: 1) Variable de entorno del sistema, 2) Fallback para desarrollo local
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Debug: Mostrar la URL que se está usando y todas las variables disponibles
console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 NEXT_PUBLIC_API_URL desde env:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Todas las variables NEXT_PUBLIC_:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

// URLs específicas del API
export const API_ENDPOINTS = {
  // Inventario
  inventario: `${API_BASE_URL}/inventario-relacional`,
  inventarioExport: `${API_BASE_URL}/inventario-relacional/export`,
  inventarioBatch: `${API_BASE_URL}/inventario-relacional/batch`,
  
  // Donaciones
  donaciones: `${API_BASE_URL}/inventario-relacional/donaciones/all`,
  donacionesSearch: `${API_BASE_URL}/inventario-relacional/donaciones/search`,
  
  // Bajas
  bajas: `${API_BASE_URL}/inventario-relacional/bajas/all`,
  bajasSearch: `${API_BASE_URL}/inventario-relacional/bajas/search`,
  
  // Artículos
  inventory: `${API_BASE_URL}/inventory`,
  inventoryBatch: `${API_BASE_URL}/inventory/batch`,
  
  // Clasificaciones
  clasificacion: `${API_BASE_URL}/clasificacion`,
  clasificacionBatch: `${API_BASE_URL}/clasificacion/batch`,
  
  // Colaboradores
  colaboradores: `${API_BASE_URL}/colaboradores`,
  colaboradoresBatch: `${API_BASE_URL}/colaboradores/batch`,
  
  // Dashboard
  dashboard: `${API_BASE_URL}/dashboard`,
  dashboardDistribucion: `${API_BASE_URL}/dashboard/distribucion-familia`,
} as const;

// Función helper para construir URLs dinámicas
export const buildApiUrl = (endpoint: string, id?: string | number) => {
  const baseUrl = API_BASE_URL + endpoint;
  return id ? `${baseUrl}/${id}` : baseUrl;
}; 
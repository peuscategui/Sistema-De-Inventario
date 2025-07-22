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

// URLs específicas del API - Usando detección automática de entorno
export const API_ENDPOINTS = {
  // Inventario - CORREGIDO: apunta al módulo correcto
  inventario: `${API_BASE_URL}/inventory`,
  inventarioExport: `${API_BASE_URL}/inventory/export`,
  inventarioBatch: `${API_BASE_URL}/inventory/batch`,
  
  // Donaciones - NOTA: estas funcionalidades deben implementarse en inventory
  donaciones: `${API_BASE_URL}/inventory/donaciones`,
  donacionesSearch: `${API_BASE_URL}/inventory/donaciones/search`,
  
  // Bajas - NOTA: estas funcionalidades deben implementarse en inventory
  bajas: `${API_BASE_URL}/inventory/bajas`,
  bajasSearch: `${API_BASE_URL}/inventory/bajas/search`,
  
  // Artículos
  inventory: `${API_BASE_URL}/inventory`,
  inventoryBatch: `${API_BASE_URL}/inventory/batch`,
  
  // Clasificaciones
  clasificacion: `${API_BASE_URL}/clasificacion`,
  clasificacionBatch: `${API_BASE_URL}/clasificacion/batch`,
  
  // Colaboradores
  colaboradores: `${API_BASE_URL}/colaboradores`,
  colaboradoresBatch: `${API_BASE_URL}/colaboradores/batch`,

  // Empleados
  empleados: `${API_BASE_URL}/empleados`,
  
  // Dashboard - NOTA: módulo temporalmente deshabilitado
  dashboard: `${API_BASE_URL}/dashboard`,
  dashboardDistribucion: `${API_BASE_URL}/dashboard/distribucion-familia`,
  
  // Usuarios y permisos (Sistema de administración)
  users: `${API_BASE_URL}/users`,
  permissions: `${API_BASE_URL}/permissions`,
  
  // Autenticación
  auth: `${API_BASE_URL}/auth`,
  
  // Licencias y estructura organizacional
  licencias: `${API_BASE_URL}/licencias`,
  licenciasDashboard: `${API_BASE_URL}/licencias/dashboard`,
  areas: `${API_BASE_URL}/areas`,
  areasActive: `${API_BASE_URL}/areas/active`,
  gerencias: `${API_BASE_URL}/gerencias`,
  gerenciasActive: `${API_BASE_URL}/gerencias/active`,
} as const;

// Función helper para construir URLs dinámicas
export const buildApiUrl = (endpoint: string, id?: string | number) => {
  const baseUrl = API_BASE_URL + endpoint;
  return id ? `${baseUrl}/${id}` : baseUrl;
}; 
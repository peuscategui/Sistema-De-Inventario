// Configuración de la API
const developmentUrl = 'http://localhost:3002';
const productionUrl = 'https://tiinventory.efc.com.pe';

// Usar la variable de entorno si está definida, si no, detectar entorno automáticamente
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Determinar la URL a usar
// Prioridad: 1) Variable de entorno, 2) Detección automática de entorno
let apiUrl;
if (configuredApiUrl) {
  apiUrl = configuredApiUrl;
} else {
  // Detectar entorno automáticamente
  if (process.env.NODE_ENV === 'development') {
    apiUrl = developmentUrl;
  } else {
    apiUrl = productionUrl;
  }
}

export const API_BASE_URL = apiUrl;

// Debug: Mostrar la URL que se está usando
console.log('🔧 Entorno:', process.env.NODE_ENV);
console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

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
  dashboardFinanciero: `${API_BASE_URL}/dashboard/analisis-financiero`,
  
  // Usuarios y permisos (Sistema de administración)
  users: `${API_BASE_URL}/users`,
  permissions: `${API_BASE_URL}/permissions`,
  roles: `${API_BASE_URL}/roles`,
  
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
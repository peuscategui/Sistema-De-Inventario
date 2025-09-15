// Simular diferentes escenarios de variables de entorno
console.log('🔍 Probando configuración de API...\n');

const scenarios = [
  {
    name: 'Sin variable de entorno (producción)',
    env: { NEXT_PUBLIC_API_URL: undefined }
  },
  {
    name: 'Con variable de entorno personalizada',
    env: { NEXT_PUBLIC_API_URL: 'http://192.168.40.79:3002' }
  },
  {
    name: 'Con variable de entorno localhost',
    env: { NEXT_PUBLIC_API_URL: 'http://localhost:3002' }
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`📋 ${scenario.name}:`);
  
  // Simular el proceso.env
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = scenario.env.NEXT_PUBLIC_API_URL;
  
  // Simular la lógica de configuración
  const developmentUrl = 'http://localhost:3002';
  const productionUrl = 'http://192.168.40.79:3002';
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  let apiUrl;
  if (configuredApiUrl) {
    apiUrl = configuredApiUrl;
  } else {
    apiUrl = productionUrl;
  }
  
  console.log(`   NEXT_PUBLIC_API_URL: ${configuredApiUrl || 'undefined'}`);
  console.log(`   URL resultante: ${apiUrl}`);
  console.log(`   ✅ ${apiUrl.includes('192.168.40.79') ? 'IP de producción' : 'Otra URL'}`);
  console.log('');
  
  // Restaurar el entorno original
  process.env.NEXT_PUBLIC_API_URL = originalEnv;
});

console.log('🎯 Configuración final:');
console.log('   - Por defecto: http://192.168.40.79:3002');
console.log('   - Personalizada: Usar NEXT_PUBLIC_API_URL si está definida');
console.log('   - Esto asegura que siempre use la IP de producción por defecto');

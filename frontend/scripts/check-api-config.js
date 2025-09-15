console.log('🔍 Verificando configuración de API...\n');

// Simular diferentes entornos
const environments = [
  { name: 'Desarrollo', NODE_ENV: 'development', NEXT_PUBLIC_API_URL: undefined },
  { name: 'Desarrollo con URL personalizada', NODE_ENV: 'development', NEXT_PUBLIC_API_URL: 'http://192.168.1.100:3002' },
  { name: 'Producción', NODE_ENV: 'production', NEXT_PUBLIC_API_URL: undefined },
  { name: 'Producción con URL personalizada', NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'http://192.168.40.79:3002' },
];

environments.forEach((env, index) => {
  console.log(`📋 ${env.name}:`);
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   NEXT_PUBLIC_API_URL: ${env.NEXT_PUBLIC_API_URL || 'undefined'}`);
  
  // Simular la lógica de configuración
  const isProduction = env.NODE_ENV === 'production';
  const developmentUrl = 'http://localhost:3002';
  const productionUrl = 'http://192.168.40.79:3002';
  const configuredApiUrl = env.NEXT_PUBLIC_API_URL;
  
  let apiUrl;
  if (isProduction) {
    apiUrl = configuredApiUrl || productionUrl;
  } else {
    apiUrl = configuredApiUrl || developmentUrl;
  }
  
  console.log(`   URL resultante: ${apiUrl}`);
  console.log(`   ✅ ${apiUrl.includes('192.168.40.79') ? 'Producción' : 'Desarrollo'}`);
  console.log('');
});

console.log('🎯 Configuración esperada:');
console.log('   - Desarrollo: http://localhost:3002');
console.log('   - Producción: http://192.168.40.79:3002');
console.log('   - Personalizada: Usar NEXT_PUBLIC_API_URL si está definida');

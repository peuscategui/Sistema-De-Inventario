const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Microsoft OAuth...\n');

// Verificar archivo .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extraer variables de Microsoft
  const microsoftVars = {
    CLIENT_ID: envContent.match(/MICROSOFT_CLIENT_ID=(.+)/)?.[1],
    CLIENT_SECRET: envContent.match(/MICROSOFT_CLIENT_SECRET=(.+)/)?.[1],
    TENANT_ID: envContent.match(/MICROSOFT_TENANT_ID=(.+)/)?.[1],
    REDIRECT_URI: envContent.match(/MICROSOFT_REDIRECT_URI=(.+)/)?.[1]
  };
  
  console.log('\n📋 Variables de Microsoft OAuth:');
  console.log('CLIENT_ID:', microsoftVars.CLIENT_ID || '❌ NO ENCONTRADO');
  console.log('CLIENT_SECRET:', microsoftVars.CLIENT_SECRET ? '✅ CONFIGURADO' : '❌ NO ENCONTRADO');
  console.log('TENANT_ID:', microsoftVars.TENANT_ID || '❌ NO ENCONTRADO');
  console.log('REDIRECT_URI:', microsoftVars.REDIRECT_URI || '❌ NO ENCONTRADO');
  
  // Verificar si hay placeholders
  const hasPlaceholders = Object.values(microsoftVars).some(value => 
    value && (value.includes('your_') || value.includes('_here'))
  );
  
  if (hasPlaceholders) {
    console.log('\n⚠️  ADVERTENCIA: Se encontraron placeholders en las variables');
    console.log('   Esto causará errores de autenticación');
  }
  
} else {
  console.log('❌ Archivo .env no encontrado');
}

// Verificar variables de entorno del sistema
console.log('\n🔧 Variables de entorno del sistema:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('MICROSOFT_CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID || 'undefined');
console.log('MICROSOFT_TENANT_ID:', process.env.MICROSOFT_TENANT_ID || 'undefined');

console.log('\n✅ Verificación completada');

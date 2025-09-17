console.log('🔍 Verificando configuración para producción...\n');

// Verificar variables de entorno críticas para Microsoft OAuth
const requiredVars = [
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET', 
  'MICROSOFT_TENANT_ID',
  'MICROSOFT_REDIRECT_URI',
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV'
];

console.log('📋 Variables requeridas para producción:');
let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('PASSWORD')) {
      console.log(`✅ ${varName}: [CONFIGURADO]`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: [NO CONFIGURADO]`);
    allConfigured = false;
  }
});

console.log('\n🔧 Configuración de Microsoft OAuth:');
console.log('CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID || '[NO CONFIGURADO]');
console.log('TENANT_ID:', process.env.MICROSOFT_TENANT_ID || '[NO CONFIGURADO]');
console.log('REDIRECT_URI:', process.env.MICROSOFT_REDIRECT_URI || '[NO CONFIGURADO]');

// Verificar si hay placeholders
const hasPlaceholders = Object.values(process.env).some(value => 
  value && (value.includes('your_') || value.includes('_here'))
);

if (hasPlaceholders) {
  console.log('\n⚠️  ADVERTENCIA: Se encontraron placeholders en las variables');
  console.log('   Esto causará errores de autenticación');
  allConfigured = false;
}

console.log('\n' + (allConfigured ? '✅' : '❌') + ' Configuración ' + (allConfigured ? 'completa' : 'incompleta'));

if (!allConfigured) {
  console.log('\n📝 Para configurar en EasyPanel, agrega estas variables:');
  console.log('MICROSOFT_CLIENT_ID=6e76e432-2c58-46b2-b7e1-72d9ea19484b');
  console.log('MICROSOFT_CLIENT_SECRET=[CONFIGURAR_EN_EASYPANEL]');
  console.log('MICROSOFT_TENANT_ID=03d7d42f-3c61-4d6d-a8bd-393098428b4c');
  console.log('MICROSOFT_REDIRECT_URI=https://192.168.40.79:3002/auth/microsoft/callback');
  console.log('DATABASE_URL=postgresql://postgres:postgres@192.168.40.129:5432/inventario_efc?schema=public');
  console.log('JWT_SECRET=tu_jwt_secret_muy_seguro_cambia_esto_en_produccion');
  console.log('NODE_ENV=production');
}

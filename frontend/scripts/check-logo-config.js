const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del logo...\n');

// Verificar archivos locales
const localLogoPath = path.join(__dirname, '..', 'public', 'efc-logo.png');
const localLogoExists = fs.existsSync(localLogoPath);

console.log('📁 Archivos locales:');
console.log(`   public/efc-logo.png: ${localLogoExists ? '✅ Existe' : '❌ No existe'}`);

if (localLogoExists) {
  const stats = fs.statSync(localLogoPath);
  console.log(`   Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Modificado: ${stats.mtime.toLocaleString()}`);
}

// Verificar configuración de Next.js
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
const nextConfigExists = fs.existsSync(nextConfigPath);

console.log('\n⚙️ Configuración Next.js:');
console.log(`   next.config.ts: ${nextConfigExists ? '✅ Existe' : '❌ No existe'}`);

if (nextConfigExists) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  const hasRewrite = configContent.includes('rewrites');
  const hasLogoRewrite = configContent.includes('efc-logo.png');
  
  console.log(`   Configuración rewrites: ${hasRewrite ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`   Rewrite para logo: ${hasLogoRewrite ? '✅ Configurado' : '❌ No configurado'}`);
}

// Verificar componente Logo
const logoComponentPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'Logo.tsx');
const logoComponentExists = fs.existsSync(logoComponentPath);

console.log('\n🎨 Componente Logo:');
console.log(`   Logo.tsx: ${logoComponentExists ? '✅ Existe' : '❌ No existe'}`);

if (logoComponentExists) {
  const logoContent = fs.readFileSync(logoComponentPath, 'utf8');
  const hasErrorHandling = logoContent.includes('onError');
  const hasEnvCheck = logoContent.includes('NODE_ENV');
  
  console.log(`   Manejo de errores: ${hasErrorHandling ? '✅ Implementado' : '❌ No implementado'}`);
  console.log(`   Verificación de entorno: ${hasEnvCheck ? '✅ Implementada' : '❌ No implementada'}`);
}

console.log('\n📋 Resumen:');
console.log('   - Desarrollo: Logo se sirve desde public/efc-logo.png');
console.log('   - Producción: Logo se redirige a /etc/easypanel/projects/sistemas/efc-logo.png');
console.log('   - Fallback: Si falla la carga, intenta la ruta por defecto');

console.log('\n✅ Configuración completada!');

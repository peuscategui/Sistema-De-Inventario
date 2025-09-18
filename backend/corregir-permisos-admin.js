const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function corregirPermisosAdmin() {
  console.log('🔧 Corrigiendo permisos del rol ADMIN...');

  try {
    // Quitar permisos de gestión de usuarios del rol ADMIN
    await prisma.$executeRaw`
      UPDATE roles 
      SET permisos = ${JSON.stringify(['inventory:read', 'inventory:write', 'inventory:delete', 'reports:read'])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE nombre = 'ADMIN';
    `;

    // También corregir el rol MANAGER para que sea consistente
    await prisma.$executeRaw`
      UPDATE roles 
      SET permisos = ${JSON.stringify(['inventory:read', 'inventory:write', 'inventory:delete', 'reports:read'])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE nombre = 'MANAGER';
    `;

    console.log('✅ Permisos corregidos!');

    // Verificar los cambios
    console.log('\n📋 ROLES ACTUALIZADOS:');
    const roles = await prisma.$queryRaw`
      SELECT nombre, descripcion, permisos FROM roles ORDER BY nombre
    `;
    
    roles.forEach(role => {
      console.log(`\n👑 ${role.nombre}:`);
      console.log(`   Descripción: ${role.descripcion}`);
      console.log(`   Permisos: ${JSON.stringify(role.permisos)}`);
    });

    // Verificar que ADMIN ya no tenga permisos de gestión de usuarios
    const adminRole = roles.find(r => r.nombre === 'ADMIN');
    if (adminRole) {
      const hasUserManagement = adminRole.permisos.some(p => 
        p.includes('users:') || p.includes('permissions:') || p === '*'
      );
      console.log(`\n✅ ADMIN puede gestionar usuarios: ${hasUserManagement ? '❌ SÍ (PROBLEMA)' : '✅ NO (CORRECTO)'}`);
    }

    console.log('\n🎉 Corrección completada!');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirPermisosAdmin();

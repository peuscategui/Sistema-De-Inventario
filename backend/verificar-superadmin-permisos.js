const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function verificarSuperAdminPermisos() {
  console.log('🔍 Verificando permisos del SUPER_ADMIN...');

  try {
    // 1. Verificar el usuario superadmin
    const superAdminUser = await prisma.$queryRaw`
      SELECT id, email, username, "isAdmin" FROM "user" WHERE email = 'superadmin@efc.com.pe'
    `;

    console.log('👤 Usuario SUPER_ADMIN:');
    console.log(`   ID: ${superAdminUser[0].id}`);
    console.log(`   Email: ${superAdminUser[0].email}`);
    console.log(`   Username: ${superAdminUser[0].username}`);
    console.log(`   isAdmin: ${superAdminUser[0].isAdmin}`);

    // 2. Verificar sus roles
    const userRoles = await prisma.$queryRaw`
      SELECT 
        r.nombre AS role_name,
        r.descripcion AS role_description,
        r.permisos AS role_permissions
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'superadmin@efc.com.pe'
    `;

    console.log('\n📋 Roles del SUPER_ADMIN:');
    userRoles.forEach(role => {
      console.log(`   - ${role.role_name}: ${role.role_description}`);
      console.log(`     Permisos: ${JSON.stringify(role.role_permissions)}`);
    });

    // 3. Verificar si tiene permisos de gestión de usuarios
    const hasUserManagement = userRoles.some(role => 
      role.role_permissions.includes('*') || 
      role.role_permissions.some(p => p.includes('users:') || p.includes('permissions:'))
    );

    console.log(`\n✅ Puede gestionar usuarios: ${hasUserManagement ? 'SÍ' : 'NO'}`);

    // 4. Verificar el campo isAdmin
    console.log(`\n🔧 Campo isAdmin: ${superAdminUser[0].isAdmin ? 'true' : 'false'}`);
    console.log('   Este campo se usa en el header del frontend');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSuperAdminPermisos();

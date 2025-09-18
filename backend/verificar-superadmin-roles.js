const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarSuperAdmin() {
  try {
    console.log('🔍 Verificando roles del usuario superadmin...\n');

    // Buscar el usuario superadmin
    const user = await prisma.user.findFirst({
      where: { username: 'superadmin' }
    });

    if (!user) {
      console.log('❌ Usuario superadmin no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:', {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // Obtener roles del usuario
    const userRoles = await prisma.$queryRaw`
      SELECT 
        ur.id,
        ur.user_id,
        ur.role_id,
        ur.assigned_at,
        ur.assigned_by,
        r.id as role_id,
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos as role_permisos
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${user.id}
    `;

    console.log('\n🔐 Roles asignados:');
    if (userRoles.length === 0) {
      console.log('❌ No tiene roles asignados');
    } else {
      userRoles.forEach(ur => {
        console.log(`  - ${ur.role_nombre}: ${ur.role_descripcion}`);
        console.log(`    Permisos: ${Array.isArray(ur.role_permisos) ? ur.role_permisos.join(', ') : 'N/A'}`);
      });
    }

    // Verificar si tiene el rol SUPER_ADMIN
    const hasSuperAdmin = userRoles.some(ur => ur.role_nombre === 'SUPER_ADMIN');
    console.log(`\n✅ Tiene rol SUPER_ADMIN: ${hasSuperAdmin ? 'SÍ' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSuperAdmin();

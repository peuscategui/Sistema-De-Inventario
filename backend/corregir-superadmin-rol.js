const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function corregirSuperAdminRol() {
  console.log('🔧 Corrigiendo rol del SUPER_ADMIN...');

  try {
    // 1. Verificar el usuario superadmin
    const superAdminUser = await prisma.$queryRaw`
      SELECT id, email, username, "isAdmin" FROM "user" WHERE email = 'superadmin@efc.com.pe'
    `;

    console.log('👤 Usuario SUPER_ADMIN encontrado:');
    console.log(`   ID: ${superAdminUser[0].id}`);
    console.log(`   Email: ${superAdminUser[0].email}`);
    console.log(`   Username: ${superAdminUser[0].username}`);
    console.log(`   isAdmin: ${superAdminUser[0].isAdmin}`);

    // 2. Verificar sus roles actuales
    const userRoles = await prisma.$queryRaw`
      SELECT 
        u.email,
        r.nombre AS role_name,
        r.descripcion AS role_description
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'superadmin@efc.com.pe'
    `;

    console.log('\n📋 Roles actuales del SUPER_ADMIN:');
    userRoles.forEach(role => {
      console.log(`   - ${role.role_name}: ${role.role_description}`);
    });

    // 3. Verificar que tenga el rol SUPER_ADMIN
    const hasSuperAdminRole = userRoles.some(role => role.role_name === 'SUPER_ADMIN');
    console.log(`\n✅ Tiene rol SUPER_ADMIN: ${hasSuperAdminRole ? 'Sí' : 'No'}`);

    if (!hasSuperAdminRole) {
      console.log('❌ El usuario no tiene el rol SUPER_ADMIN asignado!');
      
      // Obtener el ID del rol SUPER_ADMIN
      const superAdminRole = await prisma.$queryRaw`
        SELECT id FROM roles WHERE nombre = 'SUPER_ADMIN'
      `;

      if (superAdminRole.length > 0) {
        console.log('🔗 Asignando rol SUPER_ADMIN...');
        await prisma.$executeRaw`
          INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
          VALUES (${superAdminUser[0].id}, ${superAdminRole[0].id}, CURRENT_TIMESTAMP, ${superAdminUser[0].id})
          ON CONFLICT (user_id, role_id) DO NOTHING;
        `;
        console.log('✅ Rol SUPER_ADMIN asignado correctamente!');
      } else {
        console.log('❌ No se encontró el rol SUPER_ADMIN en la base de datos!');
      }
    }

    // 4. Verificar el resultado final
    console.log('\n🔍 Verificación final:');
    const finalRoles = await prisma.$queryRaw`
      SELECT 
        u.email,
        u.username,
        r.nombre AS role_name,
        r.descripcion AS role_description
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'superadmin@efc.com.pe'
    `;

    console.log('📋 Roles finales del SUPER_ADMIN:');
    finalRoles.forEach(role => {
      console.log(`   - ${role.role_name}: ${role.role_description}`);
    });

    console.log('\n🎉 Corrección completada!');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirSuperAdminRol();

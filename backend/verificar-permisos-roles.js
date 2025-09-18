const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function verificarPermisosRoles() {
  console.log('🔍 Verificando sistema de permisos y roles...');

  try {
    // 1. Mostrar todos los roles y sus permisos
    console.log('\n📋 ROLES Y PERMISOS:');
    console.log('==================');
    const roles = await prisma.$queryRaw`
      SELECT nombre, descripcion, permisos FROM roles ORDER BY nombre
    `;
    
    roles.forEach(role => {
      console.log(`\n👑 ${role.nombre}:`);
      console.log(`   Descripción: ${role.descripcion}`);
      console.log(`   Permisos: ${JSON.stringify(role.permisos, null, 2)}`);
    });

    // 2. Mostrar usuarios con sus roles
    console.log('\n\n👥 USUARIOS Y ROLES:');
    console.log('==================');
    const usersWithRoles = await prisma.$queryRaw`
      SELECT
        u.id,
        u.email,
        u.username,
        u."isAdmin",
        u."isActive",
        r.nombre AS role_name,
        r.descripcion AS role_description,
        r.permisos AS role_permissions
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;

    const userMap = new Map();
    usersWithRoles.forEach(row => {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          email: row.email,
          username: row.username,
          isAdmin: row.isAdmin,
          isActive: row.isActive,
          roles: []
        });
      }
      if (row.role_name) {
        userMap.get(row.id).roles.push({
          name: row.role_name,
          description: row.role_description,
          permissions: row.role_permissions
        });
      }
    });

    userMap.forEach(user => {
      console.log(`\n👤 ${user.username} (${user.email})`);
      console.log(`   Admin: ${user.isAdmin ? 'Sí' : 'No'}`);
      console.log(`   Activo: ${user.isActive ? 'Sí' : 'No'}`);
      if (user.roles.length > 0) {
        console.log(`   Roles:`);
        user.roles.forEach(role => {
          console.log(`     - ${role.name}: ${role.description}`);
          console.log(`       Permisos: ${JSON.stringify(role.permissions)}`);
        });
      } else {
        console.log(`   Sin roles asignados`);
      }
    });

    // 3. Verificar permisos específicos
    console.log('\n\n🔐 VERIFICACIÓN DE PERMISOS:');
    console.log('==========================');
    
    const superAdminUsers = Array.from(userMap.values()).filter(user => 
      user.roles.some(role => role.name === 'SUPER_ADMIN')
    );
    
    const adminUsers = Array.from(userMap.values()).filter(user => 
      user.roles.some(role => role.name === 'ADMIN') && 
      !user.roles.some(role => role.name === 'SUPER_ADMIN')
    );
    
    const regularUsers = Array.from(userMap.values()).filter(user => 
      user.roles.some(role => role.name === 'USER') && 
      !user.roles.some(role => role.name === 'ADMIN' || role.name === 'SUPER_ADMIN')
    );

    console.log(`\n👑 Super Administradores (${superAdminUsers.length}):`);
    superAdminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });

    console.log(`\n⚙️ Administradores regulares (${adminUsers.length}):`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });

    console.log(`\n👤 Usuarios regulares (${regularUsers.length}):`);
    regularUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });

    // 4. Verificar que ADMIN no tenga permisos de gestión de usuarios
    console.log('\n\n✅ VERIFICACIÓN DE RESTRICCIONES:');
    console.log('================================');
    
    const adminRole = roles.find(r => r.nombre === 'ADMIN');
    if (adminRole) {
      const hasUserManagement = adminRole.permisos.some(p => 
        p.includes('users:') || p.includes('permissions:') || p === '*'
      );
      console.log(`ADMIN puede gestionar usuarios: ${hasUserManagement ? '❌ SÍ (PROBLEMA)' : '✅ NO (CORRECTO)'}`);
    }

    const superAdminRole = roles.find(r => r.nombre === 'SUPER_ADMIN');
    if (superAdminRole) {
      const hasAllPermissions = superAdminRole.permisos.includes('*');
      console.log(`SUPER_ADMIN tiene todos los permisos: ${hasAllPermissions ? '✅ SÍ (CORRECTO)' : '❌ NO (PROBLEMA)'}`);
    }

    console.log('\n🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPermisosRoles();

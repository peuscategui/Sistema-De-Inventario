const { PrismaClient } = require('./generated/prisma');

async function testRoles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Probando sistema de roles...');
    
    // 1. Verificar roles creados
    console.log('\n1. Verificando roles:');
    const roles = await prisma.$queryRaw`SELECT * FROM roles ORDER BY id;`;
    roles.forEach(role => {
      console.log(`- ${role.nombre}: ${role.descripcion}`);
      console.log(`  Permisos: ${JSON.stringify(role.permisos)}`);
    });
    
    // 2. Verificar asignaciones de roles
    console.log('\n2. Verificando asignaciones de roles:');
    const userRoles = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u."fullName",
        r.nombre as role_nombre,
        r.descripcion as role_descripcion
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    
    userRoles.forEach(user => {
      console.log(`👤 ${user.fullName} (${user.email})`);
      console.log(`   Rol: ${user.role_nombre} - ${user.role_descripcion}`);
    });
    
    // 3. Probar consultas de permisos
    console.log('\n3. Probando consultas de permisos:');
    
    // Obtener permisos del admin
    const adminPermissions = await prisma.$queryRaw`
      SELECT 
        u.email,
        r.nombre as role_nombre,
        r.permisos
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'admin@efc.com';
    `;
    
    console.log('Permisos del admin:');
    adminPermissions.forEach(admin => {
      console.log(`- Rol: ${admin.role_nombre}`);
      console.log(`- Permisos: ${JSON.stringify(admin.permisos)}`);
    });
    
    // Obtener permisos de un usuario normal
    const userPermissions = await prisma.$queryRaw`
      SELECT 
        u.email,
        r.nombre as role_nombre,
        r.permisos
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'peuscategui@efc.com.pe';
    `;
    
    console.log('\nPermisos de usuario normal:');
    userPermissions.forEach(user => {
      console.log(`- Rol: ${user.role_nombre}`);
      console.log(`- Permisos: ${JSON.stringify(user.permisos)}`);
    });
    
    // 4. Probar asignación de nuevo rol
    console.log('\n4. Probando asignación de rol MANAGER:');
    
    // Asignar rol MANAGER a Pamela
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      SELECT u.id, r.id, CURRENT_TIMESTAMP, (SELECT id FROM "user" WHERE email = 'admin@efc.com')
      FROM "user" u, roles r
      WHERE u.email = 'peuscategui@efc.com.pe' AND r.nombre = 'MANAGER'
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `;
    
    // Verificar la nueva asignación
    const pamelaRoles = await prisma.$queryRaw`
      SELECT 
        u.email,
        r.nombre as role_nombre,
        r.descripcion
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'peuscategui@efc.com.pe';
    `;
    
    console.log('Roles de Pamela después de asignar MANAGER:');
    pamelaRoles.forEach(role => {
      console.log(`- ${role.role_nombre}: ${role.descripcion}`);
    });
    
    console.log('\n✅ Pruebas del sistema de roles completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoles();

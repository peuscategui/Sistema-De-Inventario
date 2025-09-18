const { PrismaClient } = require('./generated/prisma');

async function crearRolesSimple() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Creando sistema de roles...');
    
    // 1. Limpiar referencias primero
    console.log('🔧 Limpiando referencias...');
    await prisma.$executeRaw`UPDATE usuarios SET rol_id = NULL;`;
    await prisma.$executeRaw`DELETE FROM user_roles;`;
    await prisma.$executeRaw`DELETE FROM roles;`;
    
    // 2. Insertar roles uno por uno
    console.log('👥 Creando roles...');
    
    await prisma.$executeRaw`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES ('ADMIN', 'Administrador con acceso completo al sistema', '["*"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    await prisma.$executeRaw`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES ('MANAGER', 'Gerente con acceso de gestión y reportes', '["inventory:read", "inventory:write", "inventory:delete", "reports:read", "users:read"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    await prisma.$executeRaw`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES ('USER', 'Usuario con acceso básico de consulta', '["inventory:read", "reports:read"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    await prisma.$executeRaw`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES ('VIEWER', 'Visualizador con solo acceso de lectura', '["inventory:read"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    // 3. Asignar roles
    console.log('🔗 Asignando roles...');
    
    // Admin
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      SELECT u.id, r.id, CURRENT_TIMESTAMP, u.id
      FROM "user" u, roles r
      WHERE u.email = 'admin@efc.com' AND r.nombre = 'ADMIN';
    `;
    
    // Otros usuarios como USER
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      SELECT u.id, r.id, CURRENT_TIMESTAMP, (SELECT id FROM "user" WHERE email = 'admin@efc.com')
      FROM "user" u, roles r
      WHERE u.email != 'admin@efc.com' AND r.nombre = 'USER';
    `;
    
    // Actualizar tabla usuarios
    await prisma.$executeRaw`
      UPDATE usuarios 
      SET rol_id = (SELECT id FROM roles WHERE nombre = 'ADMIN')
      WHERE usuario = 'admin';
    `;
    
    // 4. Verificar resultados
    console.log('✅ Verificando resultados...');
    
    const rolesCreados = await prisma.$queryRaw`SELECT * FROM roles ORDER BY id;`;
    console.log('\n👥 Roles creados:');
    rolesCreados.forEach(role => {
      console.log(`- ${role.nombre}: ${role.descripcion}`);
    });
    
    const usuariosConRoles = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u."fullName",
        r.nombre as role_nombre
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    
    console.log('\n📊 Usuarios con roles:');
    usuariosConRoles.forEach(user => {
      console.log(`👤 ${user.fullName} (${user.email}) - Rol: ${user.role_nombre}`);
    });
    
    console.log('\n🎉 Sistema de roles creado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearRolesSimple();

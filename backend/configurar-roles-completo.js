const { PrismaClient } = require('./generated/prisma');

async function configurarRolesCompleto() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Configurando sistema de roles completo...');
    
    // 1. Primero actualizar la referencia en usuarios
    console.log('🔧 Actualizando referencias en tabla usuarios...');
    await prisma.$executeRaw`UPDATE usuarios SET rol_id = NULL;`;
    
    // 2. Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.$executeRaw`DELETE FROM user_roles;`;
    await prisma.$executeRaw`DELETE FROM roles;`;
    
    // 3. Insertar roles
    console.log('👥 Creando roles...');
    const roles = [
      {
        nombre: 'ADMIN',
        descripcion: 'Administrador con acceso completo al sistema',
        permisos: ['*'] // Todos los permisos
      },
      {
        nombre: 'MANAGER',
        descripcion: 'Gerente con acceso de gestión y reportes',
        permisos: ['inventory:read', 'inventory:write', 'inventory:delete', 'reports:read', 'users:read']
      },
      {
        nombre: 'USER',
        descripcion: 'Usuario con acceso básico de consulta',
        permisos: ['inventory:read', 'reports:read']
      },
      {
        nombre: 'VIEWER',
        descripcion: 'Visualizador con solo acceso de lectura',
        permisos: ['inventory:read']
      }
    ];
    
    for (const role of roles) {
      await prisma.$executeRaw`
        INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `, [role.nombre, role.descripcion, JSON.stringify(role.permisos)];
    }
    
    // 4. Obtener IDs de roles
    const adminRole = await prisma.$queryRaw`SELECT id FROM roles WHERE nombre = 'ADMIN'`;
    const userRole = await prisma.$queryRaw`SELECT id FROM roles WHERE nombre = 'USER'`;
    
    console.log('Admin role ID:', adminRole[0].id);
    console.log('User role ID:', userRole[0].id);
    
    // 5. Actualizar tabla usuarios con referencias a roles
    console.log('🔗 Actualizando tabla usuarios...');
    await prisma.$executeRaw`
      UPDATE usuarios 
      SET rol_id = (SELECT id FROM roles WHERE nombre = 'ADMIN')
      WHERE usuario = 'admin';
    `;
    
    // 6. Asignar roles a usuarios en la tabla user
    console.log('👤 Asignando roles a usuarios en tabla user...');
    
    // Admin existente
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
    
    // 7. Verificar resultados
    console.log('✅ Verificando resultados...');
    
    // Verificar roles creados
    const rolesCreados = await prisma.$queryRaw`SELECT * FROM roles ORDER BY id;`;
    console.log('\n👥 Roles creados:');
    rolesCreados.forEach(role => {
      console.log(`- ${role.nombre}: ${role.descripcion}`);
      console.log(`  Permisos: ${JSON.stringify(role.permisos)}`);
    });
    
    // Verificar usuarios con roles
    const usuariosConRoles = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u."fullName",
        u."isAdmin",
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        ur.assigned_at
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    
    console.log('\n📊 Usuarios con roles asignados:');
    console.log('================================');
    usuariosConRoles.forEach(user => {
      console.log(`👤 ${user.fullName} (${user.email})`);
      console.log(`   Rol: ${user.role_nombre} - ${user.role_descripcion}`);
      console.log(`   isAdmin: ${user.isAdmin}`);
      console.log(`   Asignado: ${user.assigned_at}`);
      console.log('---');
    });
    
    // Verificar tabla usuarios
    const usuariosTabla = await prisma.$queryRaw`
      SELECT u.*, r.nombre as role_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id;
    `;
    
    console.log('\n📋 Tabla usuarios actualizada:');
    usuariosTabla.forEach(user => {
      console.log(`👤 ${user.usuario} - Rol: ${user.role_nombre || 'Sin rol'}`);
    });
    
    console.log('\n🎉 Sistema de roles configurado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

configurarRolesCompleto();

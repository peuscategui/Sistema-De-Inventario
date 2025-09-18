const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function crearSuperAdmin() {
  console.log('🚀 Creando rol SUPER_ADMIN...');

  await prisma.$transaction(async (tx) => {
    // 1. Crear rol SUPER_ADMIN
    console.log('👑 Creando rol SUPER_ADMIN...');
    await tx.$executeRaw`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES ('SUPER_ADMIN', 'Super Administrador', ${JSON.stringify(['*'])}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (nombre) DO UPDATE SET
        descripcion = EXCLUDED.descripcion,
        permisos = EXCLUDED.permisos,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // 2. Crear usuario SUPER_ADMIN
    console.log('👤 Creando usuario SUPER_ADMIN...');
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const superAdminUser = await tx.$executeRaw`
      INSERT INTO "user" (username, email, "fullName", "isAdmin", "isActive", password, "createdAt", "updatedAt")
      VALUES ('superadmin', 'superadmin@efc.com.pe', 'Super Administrador', true, true, ${hashedPassword}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        "fullName" = EXCLUDED."fullName",
        "isAdmin" = EXCLUDED."isAdmin",
        "isActive" = EXCLUDED."isActive",
        password = EXCLUDED.password,
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    // 3. Obtener ID del usuario SUPER_ADMIN
    const superAdminUserId = await tx.$queryRaw`
      SELECT id FROM "user" WHERE email = 'superadmin@efc.com.pe'
    `;

    // 4. Obtener ID del rol SUPER_ADMIN
    const superAdminRole = await tx.$queryRaw`
      SELECT id FROM roles WHERE nombre = 'SUPER_ADMIN'
    `;

    // 5. Asignar rol SUPER_ADMIN al usuario
    console.log('🔗 Asignando rol SUPER_ADMIN...');
    await tx.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      VALUES (${superAdminUserId[0].id}, ${superAdminRole[0].id}, CURRENT_TIMESTAMP, ${superAdminUserId[0].id})
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `;

    // 6. Modificar rol ADMIN para quitar permisos de gestión de usuarios
    console.log('🔧 Modificando rol ADMIN...');
    await tx.$executeRaw`
      UPDATE roles 
      SET permisos = ${JSON.stringify(['inventory:read', 'inventory:write', 'inventory:delete', 'reports:read', 'users:read'])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE nombre = 'ADMIN';
    `;

    console.log('✅ Verificando resultados...');
    
    // Mostrar todos los roles
    const roles = await tx.$queryRaw`
      SELECT nombre, descripcion, permisos FROM roles ORDER BY nombre
    `;
    console.log('\n👥 Roles disponibles:');
    roles.forEach(r => console.log(`- ${r.nombre}: ${r.descripcion} (${JSON.stringify(r.permisos)})`));

    // Mostrar usuarios con roles
    const usersWithRoles = await tx.$queryRaw`
      SELECT
        u.email,
        u.username,
        r.nombre AS role_name,
        r.descripcion AS role_description
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    console.log('\n📊 Usuarios con roles:');
    usersWithRoles.forEach(u => console.log(`👤 ${u.username} (${u.email}) - Rol: ${u.role_name}`));

    console.log('\n🎉 Sistema de SUPER_ADMIN creado exitosamente!');
    console.log('\n🔑 Credenciales SUPER_ADMIN:');
    console.log('Email: superadmin@efc.com.pe');
    console.log('Password: superadmin123');
  });
}

crearSuperAdmin().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

const { PrismaClient } = require('./generated/prisma');

async function crearSistemaRoles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Iniciando creación del sistema de roles...');
    
    // 1. Crear tabla de roles si no existe
    console.log('📋 Creando tabla de roles...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // 2. Crear tabla de relación user_roles si no existe
    console.log('🔗 Creando tabla user_roles...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER REFERENCES "user"(id),
        UNIQUE(user_id, role_id)
      );
    `;
    
    // 3. Insertar roles por defecto
    console.log('👥 Creando roles por defecto...');
    
    const roles = [
      {
        name: 'ADMIN',
        display_name: 'Administrador',
        description: 'Acceso completo al sistema',
        permissions: ['*'] // Todos los permisos
      },
      {
        name: 'MANAGER',
        display_name: 'Gerente',
        description: 'Acceso de gestión y reportes',
        permissions: ['inventory:read', 'inventory:write', 'inventory:delete', 'reports:read', 'users:read']
      },
      {
        name: 'USER',
        display_name: 'Usuario',
        description: 'Acceso básico de consulta',
        permissions: ['inventory:read', 'reports:read']
      },
      {
        name: 'VIEWER',
        display_name: 'Visualizador',
        description: 'Solo lectura',
        permissions: ['inventory:read']
      }
    ];
    
    for (const roleData of roles) {
      await prisma.$executeRaw`
        INSERT INTO roles (name, display_name, description, permissions)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          permissions = EXCLUDED.permissions,
          updated_at = CURRENT_TIMESTAMP;
      `, [roleData.name, roleData.display_name, roleData.description, JSON.stringify(roleData.permissions)];
    }
    
    // 4. Obtener IDs de roles
    const adminRole = await prisma.$queryRaw`SELECT id FROM roles WHERE name = 'ADMIN'`;
    const userRole = await prisma.$queryRaw`SELECT id FROM roles WHERE name = 'USER'`;
    
    // 5. Asignar roles a usuarios existentes
    console.log('👤 Asignando roles a usuarios existentes...');
    
    // Admin existente
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_by)
      SELECT u.id, r.id, u.id
      FROM "user" u, roles r
      WHERE u.email = 'admin@efc.com' AND r.name = 'ADMIN'
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `;
    
    // Otros usuarios como USER
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_by)
      SELECT u.id, r.id, (SELECT id FROM "user" WHERE email = 'admin@efc.com')
      FROM "user" u, roles r
      WHERE u.email != 'admin@efc.com' AND r.name = 'USER'
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `;
    
    // 6. Verificar resultados
    console.log('✅ Verificando resultados...');
    
    const usuariosConRoles = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.is_admin,
        r.name as role_name,
        r.display_name as role_display_name
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    
    console.log('\n📊 Usuarios con roles asignados:');
    console.log('================================');
    usuariosConRoles.forEach(user => {
      console.log(`👤 ${user.full_name} (${user.email})`);
      console.log(`   Rol: ${user.role_display_name} (${user.role_name})`);
      console.log(`   isAdmin: ${user.is_admin}`);
      console.log('---');
    });
    
    console.log('\n🎉 Sistema de roles creado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearSistemaRoles();

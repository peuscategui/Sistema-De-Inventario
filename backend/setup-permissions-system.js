const { Pool } = require('pg');

async function setupPermissionsSystem() {
  const pool = new Pool({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🚀 Configurando sistema de permisos...');
    
    // 1. Crear tabla de roles
    console.log('📋 Creando tabla de roles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Crear tabla de permisos
    console.log('🔐 Creando tabla de permisos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 3. Crear tabla de relación usuario-rol
    console.log('👥 Creando tabla de usuarios-roles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.user(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role_id)
      );
    `);
    
    // 4. Crear tabla de relación rol-permiso
    console.log('🎭 Creando tabla de roles-permisos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, permission_id)
      );
    `);
    
    // 5. Insertar los 4 roles principales
    console.log('🎯 Insertando roles...');
    const roles = [
      { name: 'VIEW', description: 'Solo visualización de secciones específicas' },
      { name: 'USER', description: 'Acceso básico con funciones limitadas' },
      { name: 'ADMIN', description: 'Acceso administrativo completo' },
      { name: 'SUPER_ADMIN', description: 'Acceso total del sistema' }
    ];
    
    for (const role of roles) {
      await pool.query(`
        INSERT INTO public.roles (name, description) 
        VALUES ($1, $2) 
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
      `, [role.name, role.description]);
    }
    
    // 6. Insertar permisos para las secciones
    console.log('🔑 Insertando permisos...');
    const sections = ['inventario', 'bajas', 'donaciones', 'articulos', 'colaboradores', 'clasificaciones'];
    const actions = ['view', 'create', 'edit', 'delete'];
    
    for (const section of sections) {
      for (const action of actions) {
        await pool.query(`
          INSERT INTO public.permissions (name, description, resource, action) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (name) DO NOTHING;
        `, [
          `${section}_${action}`,
          `${action} ${section}`,
          section,
          action
        ]);
      }
    }
    
    // 7. Asignar permisos a roles
    console.log('🔗 Asignando permisos a roles...');
    
    // VIEW: Solo permisos de visualización
    const viewRole = await pool.query('SELECT id FROM public.roles WHERE name = $1', ['VIEW']);
    for (const section of sections) {
      const permission = await pool.query('SELECT id FROM public.permissions WHERE name = $1', [`${section}_view`]);
      if (permission.rows.length > 0) {
        await pool.query(`
          INSERT INTO public.role_permissions (role_id, permission_id) 
          VALUES ($1, $2) 
          ON CONFLICT (role_id, permission_id) DO NOTHING;
        `, [viewRole.rows[0].id, permission.rows[0].id]);
      }
    }
    
    // USER: Visualización + algunas funciones básicas
    const userRole = await pool.query('SELECT id FROM public.roles WHERE name = $1', ['USER']);
    const userPermissions = ['inventario_view', 'bajas_view', 'donaciones_view', 'articulos_view', 'colaboradores_view', 'clasificaciones_view'];
    for (const permName of userPermissions) {
      const permission = await pool.query('SELECT id FROM public.permissions WHERE name = $1', [permName]);
      if (permission.rows.length > 0) {
        await pool.query(`
          INSERT INTO public.role_permissions (role_id, permission_id) 
          VALUES ($1, $2) 
          ON CONFLICT (role_id, permission_id) DO NOTHING;
        `, [userRole.rows[0].id, permission.rows[0].id]);
      }
    }
    
    // ADMIN: Todos los permisos excepto super admin
    const adminRole = await pool.query('SELECT id FROM public.roles WHERE name = $1', ['ADMIN']);
    const allPermissions = await pool.query('SELECT id FROM public.permissions');
    for (const perm of allPermissions.rows) {
      await pool.query(`
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES ($1, $2) 
        ON CONFLICT (role_id, permission_id) DO NOTHING;
      `, [adminRole.rows[0].id, perm.id]);
    }
    
    // SUPER_ADMIN: Todos los permisos
    const superAdminRole = await pool.query('SELECT id FROM public.roles WHERE name = $1', ['SUPER_ADMIN']);
    for (const perm of allPermissions.rows) {
      await pool.query(`
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES ($1, $2) 
        ON CONFLICT (role_id, permission_id) DO NOTHING;
      `, [superAdminRole.rows[0].id, perm.id]);
    }
    
    console.log('✅ Sistema de permisos configurado exitosamente!');
    
    // Mostrar resumen
    const roleCount = await pool.query('SELECT COUNT(*) FROM public.roles');
    const permissionCount = await pool.query('SELECT COUNT(*) FROM public.permissions');
    console.log(`📊 Roles creados: ${roleCount.rows[0].count}`);
    console.log(`📊 Permisos creados: ${permissionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupPermissionsSystem();


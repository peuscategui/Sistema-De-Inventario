const { Pool } = require('pg');

async function checkExistingPermissions() {
  const pool = new Pool({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔍 Verificando sistema de permisos existente...');
    
    // Verificar roles existentes
    const roles = await pool.query('SELECT * FROM public.roles ORDER BY id;');
    console.log('🎭 Roles existentes:');
    console.table(roles.rows);
    
    // Verificar permisos existentes
    const permissions = await pool.query('SELECT * FROM public.permissions ORDER BY id;');
    console.log('\n🔐 Permisos existentes:');
    console.table(permissions.rows);
    
    // Verificar usuarios con roles
    const userRoles = await pool.query(`
      SELECT u.id, u.email, u.username, r.nombre as role_name
      FROM public.user u
      LEFT JOIN public.user_roles ur ON u.id = ur.user_id
      LEFT JOIN public.roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `);
    console.log('\n👥 Usuarios con roles:');
    console.table(userRoles.rows);
    
    // Verificar permisos por rol
    const rolePermissions = await pool.query(`
      SELECT r.nombre as role_name, p.nombre as permission_name, p.resource, p.action
      FROM public.roles r
      LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN public.permissions p ON rp.permission_id = p.id
      ORDER BY r.nombre, p.resource, p.action;
    `);
    console.log('\n🔗 Permisos por rol:');
    console.table(rolePermissions.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingPermissions();


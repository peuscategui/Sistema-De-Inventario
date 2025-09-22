const { Pool } = require('pg');

async function checkUserRoles() {
  const pool = new Pool({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔍 Verificando roles de usuarios...');
    
    // Verificar usuario específico
    const user = await pool.query(`
      SELECT u.id, u.email, u.username, u."isAdmin"
      FROM public.user u
      WHERE u.email = 'user@efc.com.pe';
    `);
    
    console.log('👤 Usuario user@efc.com.pe:');
    console.table(user.rows);
    
    if (user.rows.length > 0) {
      const userId = user.rows[0].id;
      
      // Verificar roles del usuario
      const userRoles = await pool.query(`
        SELECT r.nombre as role_name, r.descripcion
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1;
      `, [userId]);
      
      console.log('🎭 Roles del usuario:');
      console.table(userRoles.rows);
    }
    
    // Verificar todos los usuarios con roles
    const allUsers = await pool.query(`
      SELECT u.email, u.username, r.nombre as role_name
      FROM public.user u
      LEFT JOIN public.user_roles ur ON u.id = ur.user_id
      LEFT JOIN public.roles r ON ur.role_id = r.id
      ORDER BY u.email;
    `);
    
    console.log('\n👥 Todos los usuarios con roles:');
    console.table(allUsers.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserRoles();


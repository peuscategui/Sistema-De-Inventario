const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function verificarUsuarioUser() {
  try {
    await client.connect();
    console.log('🔍 Conectado a la base de datos\n');

    // Buscar el usuario 'user'
    const userResult = await client.query('SELECT * FROM "user" WHERE username = $1', ['user']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario "user" no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('👤 Usuario encontrado:', {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // Obtener roles del usuario
    const rolesResult = await client.query(`
      SELECT 
        ur.id,
        ur.user_id,
        ur.role_id,
        ur.assigned_at,
        ur.assigned_by,
        r.id as role_id,
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos as role_permisos
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [user.id]);

    console.log('\n🔐 Roles actuales del usuario "user":');
    if (rolesResult.rows.length === 0) {
      console.log('❌ No tiene roles asignados');
    } else {
      rolesResult.rows.forEach(ur => {
        console.log(`  - ${ur.role_nombre}: ${ur.role_descripcion}`);
        console.log(`    Permisos: ${Array.isArray(ur.role_permisos) ? ur.role_permisos.join(', ') : 'N/A'}`);
      });
    }

    // Verificar si tiene el rol MANAGER
    const hasManager = rolesResult.rows.some(ur => ur.role_nombre === 'MANAGER');
    console.log(`\n✅ Tiene rol MANAGER: ${hasManager ? 'SÍ' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verificarUsuarioUser();

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function crearUsuarioViewer() {
  try {
    await client.connect();
    console.log('🔍 Conectado a la base de datos\n');

    // 1. Crear usuario viewer
    console.log('1. Creando usuario viewer...');
    const userResult = await client.query(`
      INSERT INTO "user" (username, email, password, "fullName", "isActive", "isAdmin", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, username, email, "fullName"
    `, [
      'viewer',
      'viewer@efc.com.pe',
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      'Usuario Visualizador',
      true,
      false
    ]);

    const user = userResult.rows[0];
    console.log('✅ Usuario creado:', user);

    // 2. Obtener ID del rol VIEWER
    console.log('\n2. Obteniendo ID del rol VIEWER...');
    const roleResult = await client.query('SELECT id FROM roles WHERE nombre = $1', ['VIEWER']);
    
    if (roleResult.rows.length === 0) {
      console.log('❌ Rol VIEWER no encontrado');
      return;
    }

    const roleId = roleResult.rows[0].id;
    console.log('✅ Rol VIEWER encontrado con ID:', roleId);

    // 3. Asignar rol VIEWER al usuario
    console.log('\n3. Asignando rol VIEWER al usuario...');
    await client.query(`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      VALUES ($1, $2, CURRENT_TIMESTAMP, 7)
    `, [user.id, roleId]);

    console.log('✅ Rol VIEWER asignado correctamente');

    console.log('\n🎉 Usuario VIEWER creado exitosamente!');
    console.log('📧 Email: viewer@efc.com.pe');
    console.log('🔑 Password: password');
    console.log('👤 Rol: VIEWER');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

crearUsuarioViewer();

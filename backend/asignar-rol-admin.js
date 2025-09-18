const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function asignarRolAdmin() {
  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Asignar rol ADMIN al usuario admin
    const asignarAdmin = `
      UPDATE usuarios 
      SET rol_id = 1 
      WHERE usuario = 'admin';
    `;

    const result = await client.query(asignarAdmin);
    console.log(`✅ ${result.rowCount} usuario actualizado con rol ADMIN`);

    // Verificar usuarios y sus roles
    const mostrarUsuarios = await client.query(`
      SELECT u.id, u.usuario, r.nombre as rol, r.descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `);
    
    console.log('\n👥 Usuarios y sus roles:');
    mostrarUsuarios.rows.forEach(usuario => {
      console.log(`- ${usuario.usuario}: ${usuario.rol || 'Sin rol'} (${usuario.descripcion || 'Sin descripción'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

asignarRolAdmin();

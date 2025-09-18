const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function verificarEstructura() {
  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Verificar estructura de la tabla usuarios
    const estructura = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Estructura de la tabla "usuarios":');
    estructura.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar datos de usuarios
    const usuarios = await client.query('SELECT * FROM usuarios LIMIT 5');
    console.log('\n👥 Primeros 5 usuarios:');
    usuarios.rows.forEach(usuario => {
      console.log(usuario);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

verificarEstructura();

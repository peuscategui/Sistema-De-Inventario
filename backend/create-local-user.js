const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function createLocalUser() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Crear la tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        clave VARCHAR(255) NOT NULL,
        permisos VARCHAR(50) NOT NULL
      )
    `);

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insertar usuario de prueba
    await client.query(`
      INSERT INTO usuarios (usuario, clave, permisos)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario) DO UPDATE 
      SET clave = $2, permisos = $3
    `, ['admin', hashedPassword, 'admin']);

    console.log('✅ Usuario local creado/actualizado:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Permisos: admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createLocalUser();


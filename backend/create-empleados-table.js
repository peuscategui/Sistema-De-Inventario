const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function createEmpleadosTable() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n🏗️ Creando tabla empleados...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS empleados (
        id INTEGER PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        gerencia VARCHAR(255) NOT NULL,
        sede VARCHAR(255) NOT NULL
      )
    `);
    console.log('✅ Tabla empleados creada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createEmpleadosTable(); 
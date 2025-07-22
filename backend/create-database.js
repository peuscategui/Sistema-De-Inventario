const { Client } = require('pg');

async function createDatabase() {
  // Primero conectamos a la base de datos postgres por defecto
  const client = new Client({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres', // Conectamos a postgres para crear la nueva BD
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    // Verificar si la base de datos ya existe
    const checkResult = await client.query(`
      SELECT datname FROM pg_database WHERE datname = 'inventario_efc'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('ℹ️  La base de datos "inventario_efc" ya existe');
    } else {
      console.log('📝 Creando base de datos "inventario_efc"...');
      await client.query('CREATE DATABASE inventario_efc');
      console.log('✅ Base de datos "inventario_efc" creada exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase(); 
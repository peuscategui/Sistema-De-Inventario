const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function checkTables() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos PostgreSQL');

    // Listar todas las tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const result = await client.query(tablesQuery);
    console.log('📋 Tablas disponibles:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

checkTables();

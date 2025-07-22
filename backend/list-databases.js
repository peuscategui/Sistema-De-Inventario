const { Client } = require('pg');

async function listDatabases() {
  const client = new Client({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres', // Conectamos a postgres para listar las BD
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    // Listar todas las bases de datos
    const result = await client.query(`
      SELECT datname, datdba, encoding, datcollate, datctype, datistemplate, datallowconn, datconnlimit
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `);
    
    console.log('\n📋 Bases de datos disponibles:');
    console.log('='.repeat(80));
    result.rows.forEach((db, index) => {
      console.log(`${index + 1}. ${db.datname}`);
    });
    
    if (result.rows.length === 0) {
      console.log('No se encontraron bases de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listDatabases(); 
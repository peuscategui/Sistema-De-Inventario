const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function checkExactColumns() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n📋 Columnas exactas de la tabla inventory:');
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. "${row.column_name}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkExactColumns(); 
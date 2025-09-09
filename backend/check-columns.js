const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkColumns() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inventory' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas de la tabla inventory:');
    result.rows.forEach(row => console.log(`- ${row.column_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkColumns();

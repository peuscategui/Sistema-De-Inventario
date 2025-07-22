const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function checkTableStructure() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Verificar estructura de la tabla inventory
    console.log('\n📋 Estructura de la tabla inventory:');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar estructura de la tabla clasificacion
    console.log('\n📋 Estructura de la tabla clasificacion:');
    const result2 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clasificacion'
      ORDER BY ordinal_position
    `);
    
    result2.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar estructura de la tabla empleado
    console.log('\n📋 Estructura de la tabla empleado:');
    const result3 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'empleado'
      ORDER BY ordinal_position
    `);
    
    result3.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure(); 
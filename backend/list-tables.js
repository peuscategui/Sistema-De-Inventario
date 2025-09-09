const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function listTables() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Consultar todas las tablas
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const result = await client.query(query);
    
    console.log('📋 Tablas en la base de datos:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Para cada tabla, mostrar su estructura
    console.log('\n📊 Estructura de las tablas:');
    for (const row of result.rows) {
      const tableName = row.table_name;
      const structureQuery = `
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columns = await client.query(structureQuery, [tableName]);
      
      console.log(`\n🔹 Tabla: ${tableName}`);
      columns.rows.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        console.log(`   - ${col.column_name}: ${type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

listTables();

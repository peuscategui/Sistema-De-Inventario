const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function checkDBStructure() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos PostgreSQL');

    // Verificar si la base de datos existe y tiene tablas
    const dbQuery = `
      SELECT datname FROM pg_database WHERE datname = 'inventario_efc'
    `;
    
    const dbResult = await client.query(dbQuery);
    console.log('📊 Base de datos encontrada:', dbResult.rows.length > 0);
    
    if (dbResult.rows.length > 0) {
      // Listar tablas con un enfoque diferente
      const tablesQuery = `
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;
      
      const tablesResult = await client.query(tablesQuery);
      console.log('📋 Tablas en esquema public:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
      
      // También verificar si hay tablas en otros esquemas
      const allTablesQuery = `
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schemaname, tablename
      `;
      
      const allTablesResult = await client.query(allTablesQuery);
      console.log('📋 Todas las tablas:');
      allTablesResult.rows.forEach(row => {
        console.log(`  - ${row.schemaname}.${row.tablename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

checkDBStructure();

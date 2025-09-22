const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventario',
  password: 'postgres',
  port: 5432,
});

async function testConexion() {
  console.log('🔍 Probando conexión a la base de datos...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', result.rows[0].now);
    
    // Verificar tablas existentes
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Tablas existentes:');
    console.table(tables.rows);
    
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    await pool.end();
  }
}

testConexion();


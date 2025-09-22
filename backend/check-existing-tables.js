const { Pool } = require('pg');

async function checkExistingTables() {
  const pool = new Pool({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔍 Verificando tablas existentes...');
    
    // Verificar todas las tablas en el esquema public
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas existentes en public:');
    console.table(tables.rows);
    
    // Verificar si existe tabla roles
    const rolesExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'roles'
      );
    `);
    
    console.log(`\n🎭 Tabla 'roles' existe: ${rolesExists.rows[0].exists}`);
    
    if (rolesExists.rows[0].exists) {
      const rolesStructure = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'roles'
        ORDER BY ordinal_position;
      `);
      console.log('📋 Estructura de tabla roles:');
      console.table(rolesStructure.rows);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingTables();


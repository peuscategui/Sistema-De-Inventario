const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'localhost',
  database: process.env.POSTGRES_DB || 'inventario',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.DATABASE_URL ? parseInt(new URL(process.env.DATABASE_URL).port) : 5432,
});

async function verificarEstructura() {
  console.log('🔍 Verificando estructura de tablas de roles...');
  try {
    // Verificar si existe la tabla roles
    const rolesTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);
    console.log('📋 Tabla roles existe:', rolesTable.rows[0].exists);
    
    if (rolesTable.rows[0].exists) {
      const rolesStructure = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'roles'
        ORDER BY ordinal_position;
      `);
      console.log('📋 Estructura de tabla roles:');
      console.table(rolesStructure.rows);
      
      const rolesData = await pool.query('SELECT * FROM public.roles ORDER BY id');
      console.log('📋 Datos en tabla roles:');
      console.table(rolesData.rows);
    }
    
    // Verificar si existe la tabla user_roles
    const userRolesTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_roles'
      );
    `);
    console.log('📋 Tabla user_roles existe:', userRolesTable.rows[0].exists);
    
    if (userRolesTable.rows[0].exists) {
      const userRolesStructure = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_roles'
        ORDER BY ordinal_position;
      `);
      console.log('📋 Estructura de tabla user_roles:');
      console.table(userRolesStructure.rows);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

verificarEstructura();


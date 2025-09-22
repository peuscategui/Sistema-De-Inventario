const { Pool } = require('pg');

async function checkUserPermissions() {
  const pool = new Pool({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔍 Verificando estructura de la tabla public.user...');
    
    // Verificar estructura de la tabla user
    const userStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla public.user:');
    console.table(userStructure.rows);
    
    // Verificar usuarios existentes
    const users = await pool.query('SELECT id, email, role FROM public.user LIMIT 5;');
    console.log('\n👥 Usuarios existentes:');
    console.table(users.rows);
    
    // Verificar si existe tabla de permisos
    const permissionsTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%permission%';
    `);
    
    console.log('\n🔐 Tablas de permisos existentes:');
    console.table(permissionsTable.rows);
    
    // Verificar si existe tabla de roles
    const rolesTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%role%';
    `);
    
    console.log('\n🎭 Tablas de roles existentes:');
    console.table(rolesTable.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserPermissions();


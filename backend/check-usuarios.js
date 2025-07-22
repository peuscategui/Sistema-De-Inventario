const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function checkUsuarios() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n👥 Verificando usuarios en la tabla usuarios:');
    
    // Verificar estructura de la tabla
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de la tabla usuarios:');
    structureResult.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar usuarios existentes
    const usersResult = await client.query(`
      SELECT * FROM usuarios LIMIT 10
    `);
    
    console.log(`\n👤 Usuarios existentes (${usersResult.rows.length} registros):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email || 'N/A'}, Nombre: ${user.name || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsuarios(); 
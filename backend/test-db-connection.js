const { Client } = require('pg');

async function testDatabaseConnection() {
  const client = new Client({
    host: '192.168.40.129',
    port: 5432,
    database: 'inventario_efc',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('🔌 Intentando conectar a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    
    // Probar una consulta simple
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Información de la base de datos:');
    console.log('   Base de datos:', result.rows[0].current_database);
    console.log('   Usuario:', result.rows[0].current_user);
    console.log('   Versión PostgreSQL:', result.rows[0].version.split(' ')[0]);
    
    // Verificar si las tablas existen
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que PostgreSQL esté corriendo en 192.168.40.129:5432');
    console.log('   2. Verificar credenciales (usuario: postgres, contraseña: postgres)');
    console.log('   3. Verificar que la base de datos "inventario_efc" exista');
    console.log('   4. Verificar configuración de firewall');
  } finally {
    await client.end();
  }
}

testDatabaseConnection(); 
const { Client } = require('pg');

async function verifyDatabaseConnection() {
  console.log('🔍 Verificando conexión a la base de datos...\n');
  
  const client = new Client({
    host: '192.168.40.129',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('📡 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar información de la base de datos
    console.log('\n📋 Información de la base de datos:');
    const dbInfo = await client.query('SELECT current_database(), current_user, version()');
    console.log('Base de datos:', dbInfo.rows[0].current_database);
    console.log('Usuario:', dbInfo.rows[0].current_user);
    console.log('Versión:', dbInfo.rows[0].version.split(' ')[0] + ' ' + dbInfo.rows[0].version.split(' ')[1]);
    
    // Verificar tablas existentes
    console.log('\n📊 Tablas existentes:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      tables.rows.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('  ⚠️  No se encontraron tablas en el esquema public');
    }
    
    // Verificar tablas específicas del inventario
    console.log('\n🔍 Verificando tablas del inventario:');
    const inventoryTables = ['inventory', 'clasificacion', 'empleado', 'usuario'];
    
    for (const tableName of inventoryTables) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      
      if (tableExists.rows[0].exists) {
        // Contar registros
        const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`  ✅ ${tableName}: ${count.rows[0].count} registros`);
      } else {
        console.log(`  ❌ ${tableName}: No existe`);
      }
    }
    
    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que PostgreSQL esté corriendo en 192.168.40.129:5432');
    console.log('2. Verificar credenciales (usuario: postgres, contraseña: postgres)');
    console.log('3. Verificar que la base de datos "postgres" exista');
    console.log('4. Verificar conectividad de red');
  } finally {
    await client.end();
  }
}

// Ejecutar verificación
verifyDatabaseConnection();

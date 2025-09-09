const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function cleanInventory() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Verificar cantidad de registros antes de limpiar
    const { rows: before } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Registros actuales en la tabla: ${before[0].count}`);

    // Limpiar tabla inventory
    console.log('\n🧹 Limpiando tabla inventory...');
    await client.query('DELETE FROM inventory');
    console.log('✅ Tabla inventory limpiada');

    // Verificar que la tabla está vacía
    const { rows: after } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Registros después de limpiar: ${after[0].count}`);

    // Reiniciar la secuencia de IDs
    await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
    console.log('✅ Secuencia de IDs reiniciada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

cleanInventory();

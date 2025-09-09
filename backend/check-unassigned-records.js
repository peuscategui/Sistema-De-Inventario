const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkUnassignedRecords() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Buscar registros sin empleado asignado
    const { rows } = await client.query(`
      SELECT "codigoEFC", marca, modelo, "ubicacionEquipo", estado, "clasificacionId"
      FROM inventory 
      WHERE "empleadoId" IS NULL 
      ORDER BY "codigoEFC"
    `);

    console.log(`\n📋 Registros sin empleado asignado (${rows.length}):`);
    console.log('='.repeat(80));
    
    rows.forEach((record, index) => {
      console.log(`${index + 1}. ${record.codigoEFC} - ${record.marca} ${record.modelo}`);
      console.log(`   Ubicación: ${record.ubicacionEquipo} | Estado: ${record.estado} | Clasificación: ${record.clasificacionId}`);
      console.log('');
    });

    // Agrupar por clasificación
    const { rows: grouped } = await client.query(`
      SELECT "clasificacionId", COUNT(*) as cantidad
      FROM inventory 
      WHERE "empleadoId" IS NULL 
      GROUP BY "clasificacionId"
      ORDER BY cantidad DESC
    `);

    console.log('📊 Distribución por clasificación:');
    grouped.forEach(group => {
      console.log(`   Clasificación ${group.clasificacionId}: ${group.cantidad} registros`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUnassignedRecords();

const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function updateMissingEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Actualizar los registros con empleadoId correctos del CSV
    const updates = [
      { codigoEFC: 'RACKCHO0002', empleadoId: 151 },
      { codigoEFC: 'IMPTINTAEPS0006', empleadoId: 228 },
      { codigoEFC: 'IMPTINTAHP00001', empleadoId: 375 },
      { codigoEFC: 'IMPTINTAEPS0001', empleadoId: 414 },
      { codigoEFC: 'IMPTINTAEPS0002', empleadoId: 399 },
      { codigoEFC: 'IMPTINTAEPS0004', empleadoId: 414 },
      { codigoEFC: 'IMPTINTAEPS0005', empleadoId: 414 },
      { codigoEFC: 'IPADSUR0001', empleadoId: 435 },
      { codigoEFC: 'IPADSUR0002', empleadoId: 67 },
      { codigoEFC: 'IPADSUR0003', empleadoId: 317 }
    ];

    console.log(`\n🔧 Actualizando ${updates.length} registros con empleadoId...`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const result = await client.query(
          'UPDATE inventory SET "empleadoId" = $1 WHERE "codigoEFC" = $2',
          [update.empleadoId, update.codigoEFC]
        );

        if (result.rowCount > 0) {
          console.log(`✅ ${update.codigoEFC} actualizado con empleadoId: ${update.empleadoId}`);
          updatedCount++;
        } else {
          console.log(`❌ ${update.codigoEFC} no encontrado`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error actualizando ${update.codigoEFC}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumen de actualización:`);
    console.log(`✅ Registros actualizados: ${updatedCount}`);
    console.log(`❌ Registros con error: ${errorCount}`);

    // Verificar estado final
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    const { rows: [assignedCount] } = await client.query('SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NOT NULL');
    const { rows: [unassignedCount] } = await client.query('SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NULL');
    
    console.log(`\n📊 Estado final:`);
    console.log(`📋 Total registros en inventory: ${count.count}`);
    console.log(`👥 Registros con empleado asignado: ${assignedCount.count}`);
    console.log(`❌ Registros sin empleado: ${unassignedCount.count}`);

    // Mostrar los registros que aún no tienen empleado
    if (unassignedCount.count > 0) {
      const { rows: unassigned } = await client.query(`
        SELECT "codigoEFC", marca, modelo 
        FROM inventory 
        WHERE "empleadoId" IS NULL 
        ORDER BY "codigoEFC"
      `);
      
      console.log(`\n❌ Registros aún sin empleado (${unassigned.length}):`);
      unassigned.forEach(record => {
        console.log(`   - ${record.codigoEFC} - ${record.marca} ${record.modelo}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

updateMissingEmpleados();

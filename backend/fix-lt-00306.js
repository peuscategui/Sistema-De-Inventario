const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function fixLT00306() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Buscar el registro problemático
    const { rows: problematicRecord } = await client.query(`
      SELECT id, "codigoEFC", "empleadoId"
      FROM inventory
      WHERE "codigoEFC" LIKE 'LT-00306%'
    `);

    if (problematicRecord.length > 0) {
      console.log('🔍 Registro encontrado:');
      console.log(`ID: ${problematicRecord[0].id}`);
      console.log(`Código: ${problematicRecord[0].codigoEFC}`);
      console.log(`EmpleadoId: ${problematicRecord[0].empleadoId}`);

      // Actualizar el empleadoId a 414
      const { rowCount } = await client.query(
        'UPDATE inventory SET "empleadoId" = $1 WHERE id = $2',
        [414, problematicRecord[0].id]
      );

      if (rowCount > 0) {
        console.log('✅ LT-00306 actualizado con empleadoId: 414');
      } else {
        console.log('❌ No se pudo actualizar el registro');
      }
    } else {
      console.log('❌ No se encontró el registro LT-00306');
    }

    // Verificar el resultado final
    const { rows: [countWithEmpleado] } = await client.query(`
      SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NOT NULL
    `);
    const { rows: [countTotal] } = await client.query(`
      SELECT COUNT(*) FROM inventory
    `);

    console.log(`\n📊 Estado final:`);
    console.log(`📋 Total registros en inventory: ${countTotal.count}`);
    console.log(`👥 Registros con empleado asignado: ${countWithEmpleado.count}`);
    console.log(`❌ Registros sin empleado: ${countTotal.count - countWithEmpleado.count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixLT00306();

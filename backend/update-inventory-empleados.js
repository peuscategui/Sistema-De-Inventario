const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

// Mapeo de códigos EFC a empleadoId basado en los datos que cargaste
const empleadoMapping = {
  'LT-00090': 445,
  'LT-00061': 443,
  'LT-000073': 446,
  'LT-00161': 442
};

async function updateInventoryEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    console.log('📥 Actualizando empleadoId en registros de inventario...\n');

    let updated = 0;
    let notFound = 0;

    for (const [codigoEFC, empleadoId] of Object.entries(empleadoMapping)) {
      try {
        const { rowCount } = await client.query(
          'UPDATE inventory SET "empleadoId" = $1 WHERE "codigoEFC" = $2',
          [empleadoId, codigoEFC]
        );

        if (rowCount > 0) {
          console.log(`✅ ${codigoEFC} -> empleadoId: ${empleadoId}`);
          updated++;
        } else {
          console.log(`❌ No se encontró: ${codigoEFC}`);
          notFound++;
        }
      } catch (error) {
        console.error(`❌ Error actualizando ${codigoEFC}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de actualización:');
    console.log(`✅ Registros actualizados: ${updated}`);
    console.log(`❌ Registros no encontrados: ${notFound}`);

    // Verificar el resultado
    const { rows: [count] } = await client.query(`
      SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NOT NULL
    `);
    console.log(`\n📊 Total registros con empleado asignado: ${count.count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

updateInventoryEmpleados();

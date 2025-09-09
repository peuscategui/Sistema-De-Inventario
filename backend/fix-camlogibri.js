const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function fixCamlogibri() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Actualizar CAMLOGIBRI001 con empleadoId correcto
    const result = await client.query(
      'UPDATE inventory SET "empleadoId" = 167 WHERE "codigoEFC" = $1',
      ['CAMLOGIBRI001']
    );

    if (result.rowCount > 0) {
      console.log('✅ CAMLOGIBRI001 actualizado con empleadoId: 167');
    } else {
      console.log('❌ No se encontró el registro CAMLOGIBRI001');
    }

    // Verificar el cambio
    const { rows } = await client.query(
      'SELECT "codigoEFC", modelo, "empleadoId" FROM inventory WHERE "codigoEFC" = $1',
      ['CAMLOGIBRI001']
    );

    if (rows.length > 0) {
      console.log(`📋 Verificación: ${rows[0].codigoEFC} - ${rows[0].modelo} - empleadoId: ${rows[0].empleadoId}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixCamlogibri();

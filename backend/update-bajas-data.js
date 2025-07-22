const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function updateBajasData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n📝 Actualizando items con fecha y motivo de baja...');
    
    // Actualizar los primeros 5 items de inventory con estado 'BAJA'
    const updateResult = await client.query(`
      UPDATE inventory 
      SET 
        "fecha_baja" = '2025-07-12',
        "motivo_baja" = 'Renovación tecnológica'
      WHERE id IN (1, 2, 3, 4, 5)
      AND estado = 'BAJA'
    `);
    
    console.log(`✅ ${updateResult.rowCount} items actualizados con fecha y motivo de baja`);
    
    // Verificar los items actualizados
    const checkResult = await client.query(`
      SELECT id, "codigoEFC", estado, "fecha_baja", "motivo_baja"
      FROM inventory 
      WHERE estado = 'BAJA'
      ORDER BY id
    `);
    
    console.log('\n📋 Items con estado BAJA:');
    checkResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Código: ${item.codigoEFC}, Fecha: ${item.fecha_baja}, Motivo: ${item.motivo_baja}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateBajasData(); 
const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function updateCondicionObsoleta() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos PostgreSQL');

    // Primero, verificar cuántos items tienen estado OBSOLETO
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory 
      WHERE estado = 'OBSOLETO'
    `;
    
    const countResult = await client.query(countQuery);
    const totalItems = parseInt(countResult.rows[0].total);
    
    console.log(`📊 Encontrados ${totalItems} items con estado OBSOLETO`);
    
    if (totalItems === 0) {
      console.log('✅ No hay items con estado OBSOLETO para actualizar');
      return;
    }
    
    // Mostrar algunos ejemplos
    const examplesQuery = `
      SELECT "codigoEFC", marca, modelo, condicion
      FROM inventory 
      WHERE estado = 'OBSOLETO'
      LIMIT 5
    `;
    
    const examplesResult = await client.query(examplesQuery);
    console.log('📋 Ejemplos de items encontrados:');
    examplesResult.rows.forEach(item => {
      console.log(`  - ${item.codigoEFC}: ${item.marca} ${item.modelo} (condición actual: ${item.condicion})`);
    });
    
    // Actualizar la condición a OBSOLETA
    const updateQuery = `
      UPDATE inventory 
      SET condicion = 'OBSOLETA'
      WHERE estado = 'OBSOLETO'
    `;
    
    const updateResult = await client.query(updateQuery);
    console.log(`✅ Actualizados ${updateResult.rowCount} items con condición OBSOLETA`);
    
    // Verificar el resultado
    const verifyQuery = `
      SELECT COUNT(*) as total
      FROM inventory 
      WHERE estado = 'OBSOLETO' AND condicion = 'OBSOLETA'
    `;
    
    const verifyResult = await client.query(verifyQuery);
    const updatedCount = parseInt(verifyResult.rows[0].total);
    
    console.log(`🔍 Verificación: ${updatedCount} items ahora tienen estado OBSOLETO y condición OBSOLETA`);
    
    // Mostrar algunos ejemplos actualizados
    const updatedExamplesQuery = `
      SELECT "codigoEFC", marca, modelo, condicion
      FROM inventory 
      WHERE estado = 'OBSOLETO' AND condicion = 'OBSOLETA'
      LIMIT 5
    `;
    
    const updatedExamplesResult = await client.query(updatedExamplesQuery);
    console.log('📋 Ejemplos de items actualizados:');
    updatedExamplesResult.rows.forEach(item => {
      console.log(`  - ${item.codigoEFC}: ${item.marca} ${item.modelo} (condición: ${item.condicion})`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando condición:', error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

updateCondicionObsoleta();

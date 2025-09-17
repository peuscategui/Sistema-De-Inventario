const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'inventario_efc',
  user: 'postgres',
  password: 'postgres'
});

async function checkCondicionValues() {
  try {
    await client.connect();
    console.log('🔗 Conectado a la base de datos PostgreSQL');

    // Buscar valores únicos en el campo condicion
    const condicionQuery = `
      SELECT condicion, COUNT(*) as cantidad
      FROM inventory 
      WHERE condicion IS NOT NULL
      GROUP BY condicion
      ORDER BY cantidad DESC
    `;
    
    const condicionResult = await client.query(condicionQuery);
    console.log('📊 Valores únicos en el campo condicion:');
    condicionResult.rows.forEach(row => {
      console.log(`  - "${row.condicion}": ${row.cantidad} items`);
    });
    
    // También buscar valores nulos o vacíos
    const nullQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(condicion) as items_con_condicion,
        COUNT(*) - COUNT(condicion) as items_sin_condicion
      FROM inventory
    `;
    
    const nullResult = await client.query(nullQuery);
    console.log('\n📈 Estadísticas del campo condicion:');
    console.log(`  - Total de items: ${nullResult.rows[0].total_items}`);
    console.log(`  - Items con condición: ${nullResult.rows[0].items_con_condicion}`);
    console.log(`  - Items sin condición: ${nullResult.rows[0].items_sin_condicion}`);
    
    // Buscar items con estado OBSOLETO para ver su condición actual
    const obsoletoQuery = `
      SELECT condicion, COUNT(*) as cantidad
      FROM inventory 
      WHERE estado = 'OBSOLETO'
      GROUP BY condicion
      ORDER BY cantidad DESC
    `;
    
    const obsoletoResult = await client.query(obsoletoQuery);
    console.log('\n🔍 Items con estado OBSOLETO y su condición:');
    if (obsoletoResult.rows.length === 0) {
      console.log('  - No hay items con estado OBSOLETO');
    } else {
      obsoletoResult.rows.forEach(row => {
        console.log(`  - Condición "${row.condicion}": ${row.cantidad} items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error consultando condición:', error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

checkCondicionValues();

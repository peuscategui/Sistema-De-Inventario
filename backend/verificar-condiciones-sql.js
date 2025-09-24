const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function verificarCondiciones() {
  try {
    await client.connect();
    console.log('🔍 Verificando valores de condición en la base de datos...\n');
    
    // Obtener todos los valores únicos de condición
    const result = await client.query(`
      SELECT condicion, COUNT(*) as count 
      FROM inventory 
      WHERE condicion IS NOT NULL 
      GROUP BY condicion 
      ORDER BY count DESC
    `);
    
    console.log('📊 Valores únicos de condición encontrados:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. "${row.condicion}": ${row.count} equipos`);
    });
    
    // Verificar específicamente OBSOLETO
    const obsoletos = await client.query(`
      SELECT COUNT(*) as count 
      FROM inventory 
      WHERE condicion = 'OBSOLETO'
    `);
    
    console.log(`\n🎯 Equipos con condición "OBSOLETO": ${obsoletos.rows[0].count}`);
    
    // Verificar si hay variaciones de OBSOLETO
    const obsoletosVariaciones = await client.query(`
      SELECT condicion, COUNT(*) as count 
      FROM inventory 
      WHERE condicion ILIKE '%OBSOLET%'
      GROUP BY condicion
    `);
    
    console.log('\n🔍 Variaciones de OBSOLETO encontradas:');
    obsoletosVariaciones.rows.forEach(row => {
      console.log(`- "${row.condicion}": ${row.count} equipos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verificarCondiciones();

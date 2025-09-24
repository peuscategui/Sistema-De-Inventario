const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function probarFiltroCondicion() {
  try {
    await client.connect();
    console.log('🔍 Probando filtro de condición OBSOLETO...\n');
    
    // Simular la consulta que hace Prisma
    const result = await client.query(`
      SELECT id, "codigoEFC", marca, modelo, condicion, estado
      FROM inventory 
      WHERE condicion = 'OBSOLETO'
      AND estado NOT IN ('BAJA', 'DONACION')
      LIMIT 10
    `);
    
    console.log(`📊 Resultados encontrados: ${result.rows.length}`);
    console.log('\n📋 Primeros 10 equipos obsoletos:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.codigoEFC} - ${row.marca} ${row.modelo} - Condición: ${row.condicion} - Estado: ${row.estado}`);
    });
    
    // Contar total
    const count = await client.query(`
      SELECT COUNT(*) as total
      FROM inventory 
      WHERE condicion = 'OBSOLETO'
      AND estado NOT IN ('BAJA', 'DONACION')
    `);
    
    console.log(`\n🎯 Total de equipos obsoletos (excluyendo BAJA/DONACION): ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

probarFiltroCondicion();

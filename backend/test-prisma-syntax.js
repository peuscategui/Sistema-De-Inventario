const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function testPrismaSyntax() {
  try {
    await client.connect();
    console.log('🔍 Probando sintaxis de Prisma para filtro de familia...\n');
    
    // Simular la consulta que debería hacer Prisma con la sintaxis correcta
    const sql = `
      SELECT i.id, i."codigoEFC", i.marca, i.modelo, c.familia, i.estado
      FROM inventory i
      INNER JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'Computadora'
      LIMIT 5
    `;
    
    console.log('🔍 DEBUG: SQL con INNER JOIN:', sql);
    
    const result = await client.query(sql);
    
    console.log(`📊 Resultados encontrados: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Primeros 5 items:');
      result.rows.forEach((item, index) => {
        console.log(`${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo} - Familia: ${item.familia} - Estado: ${item.estado}`);
      });
    } else {
      console.log('\n❌ No se encontraron items');
    }
    
    // Probar con LEFT JOIN también
    const sqlLeft = `
      SELECT i.id, i."codigoEFC", i.marca, i.modelo, c.familia, i.estado
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'Computadora'
      LIMIT 5
    `;
    
    console.log('\n🔍 DEBUG: SQL con LEFT JOIN:', sqlLeft);
    
    const resultLeft = await client.query(sqlLeft);
    
    console.log(`📊 Resultados con LEFT JOIN: ${resultLeft.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testPrismaSyntax();

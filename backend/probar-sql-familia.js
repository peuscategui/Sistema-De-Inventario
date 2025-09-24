const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function probarSqlFamilia() {
  try {
    await client.connect();
    console.log('🔍 Probando consulta SQL con filtro familia=Computadora...\n');
    
    // Simular la consulta que debería hacer Prisma
    const result = await client.query(`
      SELECT i.id, i."codigoEFC", i.marca, i.modelo, c.familia, i.estado
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'Computadora'
      AND i.estado NOT IN ('BAJA', 'DONACION')
      LIMIT 5
    `);
    
    console.log(`📊 Resultados encontrados: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Primeros 5 items:');
      result.rows.forEach((item, index) => {
        console.log(`${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo} - Familia: ${item.familia} - Estado: ${item.estado}`);
      });
    } else {
      console.log('\n❌ No se encontraron items');
    }
    
    // Contar total
    const count = await client.query(`
      SELECT COUNT(*) as total
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'Computadora'
      AND i.estado NOT IN ('BAJA', 'DONACION')
    `);
    
    console.log(`\n🎯 Total de equipos de familia "Computadora": ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

probarSqlFamilia();

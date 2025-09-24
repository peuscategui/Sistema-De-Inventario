const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function debugFamiliaPrisma() {
  try {
    await client.connect();
    console.log('🔍 Debugging consulta Prisma para familia...\n');
    
    // Simular exactamente lo que hace Prisma
    const whereClause = {
      clasificacion: {
        familia: {
          equals: 'Computadora',
          mode: 'insensitive'
        }
      }
    };
    
    console.log('🔍 DEBUG: whereClause simulado:', JSON.stringify(whereClause, null, 2));
    
    // Convertir a SQL para ver qué debería hacer Prisma
    const sql = `
      SELECT i.id, i."codigoEFC", i.marca, i.modelo, c.familia, i.estado
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'Computadora'
      LIMIT 5
    `;
    
    console.log('🔍 DEBUG: SQL equivalente:', sql);
    
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

debugFamiliaPrisma();

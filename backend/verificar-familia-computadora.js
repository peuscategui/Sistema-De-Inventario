const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public'
});

async function verificarFamiliaComputadora() {
  try {
    await client.connect();
    console.log('🔍 Verificando familias en la base de datos...\n');
    
    // Obtener todas las familias únicas
    const result = await client.query(`
      SELECT c.familia, COUNT(*) as count 
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE i.estado NOT IN ('BAJA', 'DONACION')
      GROUP BY c.familia 
      ORDER BY count DESC
    `);
    
    console.log('📊 Familias encontradas:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. "${row.familia}": ${row.count} equipos`);
    });
    
    // Verificar específicamente COMPUTADORA
    const computadoras = await client.query(`
      SELECT COUNT(*) as count 
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia = 'COMPUTADORA'
      AND i.estado NOT IN ('BAJA', 'DONACION')
    `);
    
    console.log(`\n🎯 Equipos de familia "COMPUTADORA": ${computadoras.rows[0].count}`);
    
    // Verificar si hay variaciones de COMPUTADORA
    const computadorasVariaciones = await client.query(`
      SELECT c.familia, COUNT(*) as count 
      FROM inventory i
      LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
      WHERE c.familia ILIKE '%COMPUTADOR%'
      AND i.estado NOT IN ('BAJA', 'DONACION')
      GROUP BY c.familia
    `);
    
    console.log('\n🔍 Variaciones de COMPUTADORA encontradas:');
    computadorasVariaciones.rows.forEach(row => {
      console.log(`- "${row.familia}": ${row.count} equipos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verificarFamiliaComputadora();

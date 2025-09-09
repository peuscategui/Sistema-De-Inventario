const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkEmpleadoData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar registros donde gerencia y sede son iguales
    const { rows: sameData } = await client.query(`
      SELECT id, nombre, cargo, gerencia, sede
      FROM empleado 
      WHERE gerencia = sede
      ORDER BY id
      LIMIT 20
    `);

    console.log('📋 Registros donde gerencia = sede (primeros 20):');
    sameData.forEach(emp => {
      console.log(`ID: ${emp.id} | ${emp.nombre} | ${emp.cargo}`);
      console.log(`   Gerencia: ${emp.gerencia}`);
      console.log(`   Sede: ${emp.sede}`);
      console.log('');
    });

    // Contar total de registros con este problema
    const { rows: [countSame] } = await client.query(`
      SELECT COUNT(*) FROM empleado WHERE gerencia = sede
    `);

    // Contar total de empleados
    const { rows: [countTotal] } = await client.query(`
      SELECT COUNT(*) FROM empleado
    `);

    console.log(`📊 Resumen:`);
    console.log(`   Total empleados: ${countTotal.count}`);
    console.log(`   Con gerencia = sede: ${countSame.count}`);
    console.log(`   Con datos correctos: ${countTotal.count - countSame.count}`);

    // Mostrar algunos ejemplos de registros correctos
    const { rows: correctData } = await client.query(`
      SELECT id, nombre, cargo, gerencia, sede
      FROM empleado 
      WHERE gerencia != sede
      ORDER BY id
      LIMIT 5
    `);

    console.log('\n📋 Ejemplos de registros correctos:');
    correctData.forEach(emp => {
      console.log(`ID: ${emp.id} | ${emp.nombre} | ${emp.cargo}`);
      console.log(`   Gerencia: ${emp.gerencia}`);
      console.log(`   Sede: ${emp.sede}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkEmpleadoData();

const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkLastEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Obtener total de empleados
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM empleado');
    console.log(`📊 Total empleados en la base de datos: ${count.count}`);

    // Obtener los últimos 10 empleados ordenados por ID
    console.log('\n📋 Últimos 10 empleados registrados:');
    const { rows: empleados } = await client.query(`
      SELECT id, nombre
      FROM empleado
      ORDER BY id DESC
      LIMIT 10
    `);

    empleados.forEach(emp => {
      console.log(`ID ${emp.id}: ${emp.nombre}`);
    });

    // Obtener el último ID
    const { rows: [maxId] } = await client.query('SELECT MAX(id) FROM empleado');
    console.log(`\n🔢 Último ID utilizado: ${maxId.max}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkLastEmpleados();

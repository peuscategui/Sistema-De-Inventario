const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkInventoryEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar registros sin empleadoId
    const { rows: sinEmpleado } = await client.query(`
      SELECT "codigoEFC", marca, modelo, "empleadoId"
      FROM inventory
      WHERE "empleadoId" IS NULL
      ORDER BY "codigoEFC"
    `);

    console.log('📋 Registros sin empleado asignado:');
    sinEmpleado.forEach(item => {
      console.log(`${item.codigoEFC}: ${item.marca} ${item.modelo}`);
    });
    console.log(`\nTotal: ${sinEmpleado.length} registros sin empleado`);

    // Verificar total de registros
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Total registros en inventory: ${count.count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkInventoryEmpleados();

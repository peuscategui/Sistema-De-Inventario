const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar total de empleados
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM empleado');
    console.log(`📊 Total empleados: ${count.count}`);

    // Obtener IDs específicos del archivo inventory
    const idsToCheck = [33, 34, 35, 36, 37, 38, 39, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58];
    console.log('\n🔍 Verificando IDs específicos:');
    for (const id of idsToCheck) {
      const { rows } = await client.query('SELECT * FROM empleado WHERE id = $1', [id]);
      if (rows.length > 0) {
        console.log(`✅ ID ${id} existe: ${rows[0].nombre}`);
      } else {
        console.log(`❌ ID ${id} no existe en la tabla empleado`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkEmpleados();

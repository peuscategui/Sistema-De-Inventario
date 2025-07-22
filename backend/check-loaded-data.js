const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function checkLoadedData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Verificar Clasificaciones
    console.log('\n📋 CLASIFICACIONES CARGADAS:');
    console.log('='.repeat(50));
    const clasificaciones = await client.query('SELECT * FROM clasificacion ORDER BY id LIMIT 10');
    console.log(`Total registros: ${clasificaciones.rows.length}`);
    clasificaciones.rows.forEach(row => {
      console.log(`ID: ${row.id} | Familia: ${row.familia} | Sub-familia: ${row.sub_familia} | Tipo: ${row.tipo_equipo}`);
    });

    // Verificar Empleados
    console.log('\n👥 EMPLEADOS CARGADOS:');
    console.log('='.repeat(50));
    const empleados = await client.query('SELECT * FROM empleado ORDER BY id LIMIT 10');
    console.log(`Total registros: ${empleados.rows.length}`);
    empleados.rows.forEach(row => {
      console.log(`ID: ${row.id} | Nombre: ${row.nombre} | Cargo: ${row.cargo} | Gerencia: ${row.gerencia}`);
    });

    // Verificar Inventory
    console.log('\n💻 INVENTORY CARGADO:');
    console.log('='.repeat(50));
    const inventory = await client.query('SELECT * FROM inventory ORDER BY id LIMIT 5');
    console.log(`Total registros: ${inventory.rows.length}`);
    inventory.rows.forEach(row => {
      console.log(`ID: ${row.id} | Código: ${row.codigoefc} | Marca: ${row.marca} | Modelo: ${row.modelo}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkLoadedData(); 
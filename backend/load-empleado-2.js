const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function loadEmpleado2() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar si el empleado ya existe
    const { rows: existingEmployee } = await client.query(
      'SELECT id FROM empleado WHERE id = $1',
      [2]
    );

    if (existingEmployee.length > 0) {
      console.log('⚠️ El empleado con ID 2 ya existe');
      return;
    }

    // Insertar el empleado
    const query = `
      INSERT INTO empleado (id, nombre, cargo, gerencia, sede)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    const params = [
      2,
      'Elizabeth Bravo De Rueda Dumett',
      'Jefe De Compras Internacionales',
      'Gerencia De Operación Comercial Internacional',
      'Surquillo'
    ];

    await client.query(query, params);
    console.log('✅ Empleado cargado exitosamente:');
    console.log(`   ID: 2`);
    console.log(`   Nombre: Elizabeth Bravo De Rueda Dumett`);
    console.log(`   Cargo: Jefe De Compras Internacionales`);
    console.log(`   Gerencia: Gerencia De Operación Comercial Internacional`);
    console.log(`   Sede: Surquillo`);

    // Verificar la carga
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM empleado');
    console.log(`\n📊 Total empleados en la base de datos: ${count.count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

loadEmpleado2();

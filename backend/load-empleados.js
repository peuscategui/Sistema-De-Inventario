const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function loadEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla empleado primero
    console.log('\n🧹 Limpiando tabla empleado...');
    await client.query('DELETE FROM empleado');
    console.log('✅ Tabla empleado limpiada');

    // Cargar desde empleados_carga_con_id.csv
    console.log('\n👥 Cargando empleados...');
    const empleadosPath = path.join(__dirname, '..', 'empleados_carga_con_id.csv');
    
    if (fs.existsSync(empleadosPath)) {
      const csvContent = fs.readFileSync(empleadosPath, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Saltar header
      
      let count = 0;
      for (const line of lines) {
        if (line.trim()) {
          const columns = line.split(',');
          if (columns.length >= 5) {
            const [id, nombre, cargo, gerencia, sede] = columns;
            
            await client.query(`
              INSERT INTO empleado (id, nombre, cargo, gerencia, sede)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              parseInt(id), 
              nombre, 
              cargo, 
              gerencia, 
              sede
            ]);
            count++;
            
            if (count % 50 === 0) {
              console.log(`Cargados ${count} empleados...`);
            }
          }
        }
      }
      console.log(`\n✅ ${count} empleados cargados exitosamente`);
    } else {
      console.log('❌ No se encontró el archivo empleados_carga_con_id.csv');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

loadEmpleados(); 
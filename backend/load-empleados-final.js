const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function loadEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla empleado primero
    console.log('\n🧹 Limpiando tabla empleado...');
    await client.query('DELETE FROM empleado');
    await client.query('ALTER SEQUENCE empleado_id_seq RESTART WITH 1');
    console.log('✅ Tabla empleado limpiada');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '02_empleados.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Procesar cada línea
    const dataLines = lines.slice(1); // Saltar la primera línea (encabezados)
    console.log(`📊 Total registros a cargar: ${dataLines.length}`);
    console.log('\n📥 Cargando empleados...');

    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const [index, line] of dataLines.entries()) {
      try {
        // Dividir la línea manualmente para manejar valores con comas dentro de comillas
        let values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let char of line) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Añadir el último valor

        // Limpiar los valores
        values = values.map(val => val.trim());

        const query = `
          INSERT INTO empleado (
            id, nombre, cargo, gerencia, sede
          ) VALUES (
            $1, $2, $3, $4, $5
          )
        `;

        const params = [
          parseInt(values[0]),  // id
          values[1],           // nombre
          values[2],           // cargo
          values[3],           // gerencia
          values[4]            // sede
        ];

        await client.query(query, params);
        successful++;
        
        // Mostrar progreso cada 10 registros
        if (successful % 10 === 0 || successful === dataLines.length) {
          console.log(`✅ Progreso: ${successful}/${dataLines.length} registros procesados`);
        }

      } catch (error) {
        failed++;
        errors.push({
          line: index + 2,
          data: line,
          error: error.message
        });
      }
    }

    console.log('\n📊 Resumen de la carga:');
    console.log(`✅ Registros exitosos: ${successful}`);
    console.log(`❌ Registros fallidos: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errors.forEach(err => {
        console.log(`Línea ${err.line}:`);
        console.log(`Datos: ${err.data}`);
        console.log(`Error: ${err.error}\n`);
      });
    }

    // Verificar la carga
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM empleado');
    console.log(`\n📊 Total registros en la base de datos: ${count.count}`);

    // Mostrar algunos ejemplos
    const { rows: ejemplos } = await client.query('SELECT * FROM empleado ORDER BY id LIMIT 3');
    console.log('\n📋 Ejemplos de registros cargados:');
    ejemplos.forEach(emp => {
      console.log(`ID: ${emp.id}, Nombre: ${emp.nombre}, Cargo: ${emp.cargo}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

loadEmpleados();

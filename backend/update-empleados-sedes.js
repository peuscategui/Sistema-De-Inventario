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

function cleanValue(val) {
  if (!val || val.trim() === '') return null;
  return val.trim();
}

async function updateEmpleadosSedes() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo CSV actualizado
    const csvPath = path.join(__dirname, 'excel-templates', '02_empleados.csv');
    console.log(`📂 Leyendo archivo: ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Saltar el header
    const dataLines = lines.slice(1);
    console.log(`📊 Total registros a procesar: ${dataLines.length}\n`);

    let updated = 0;
    let failed = 0;
    const errors = [];

    for (const [index, line] of dataLines.entries()) {
      try {
        // Parsear la línea manualmente para manejar comas dentro de comillas
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
        values.push(currentValue);

        // Limpiar valores
        values = values.map(val => cleanValue(val));

        const id = parseInt(values[0]);
        const nombre = values[1];
        const cargo = values[2];
        const gerencia = values[3];
        const sede = values[4];

        if (isNaN(id) || !nombre) {
          console.log(`⚠️ Saltando línea ${index + 2}: datos inválidos`);
          continue;
        }

        // Actualizar el registro
        const { rowCount } = await client.query(
          'UPDATE empleado SET nombre = $1, cargo = $2, gerencia = $3, sede = $4 WHERE id = $5',
          [nombre, cargo, gerencia, sede, id]
        );

        if (rowCount > 0) {
          updated++;
          console.log(`✅ ID ${id}: ${nombre} - Sede: ${sede}`);
        } else {
          console.log(`⚠️ No se encontró empleado con ID ${id}`);
        }

        // Mostrar progreso cada 50 registros
        if (updated % 50 === 0) {
          console.log(`📊 Progreso: ${updated} registros actualizados`);
        }

      } catch (error) {
        failed++;
        errors.push({
          line: index + 2,
          data: line,
          error: error.message
        });
        console.error(`❌ Error en línea ${index + 2}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de la actualización:');
    console.log(`✅ Registros actualizados: ${updated}`);
    console.log(`❌ Registros fallidos: ${failed}`);

    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errors.slice(0, 10).forEach(err => {
        console.log(`Línea ${err.line}: ${err.error}`);
      });
    }

    // Verificar el resultado
    const { rows: [countSame] } = await client.query(`
      SELECT COUNT(*) FROM empleado WHERE gerencia = sede
    `);
    const { rows: [countTotal] } = await client.query(`
      SELECT COUNT(*) FROM empleado
    `);

    console.log(`\n📊 Estado final:`);
    console.log(`   Total empleados: ${countTotal.count}`);
    console.log(`   Con gerencia = sede: ${countSame.count}`);
    console.log(`   Con datos correctos: ${countTotal.count - countSame.count}`);

    // Mostrar algunos ejemplos de sedes
    const { rows: sedes } = await client.query(`
      SELECT DISTINCT sede, COUNT(*) as cantidad
      FROM empleado 
      WHERE sede IS NOT NULL
      GROUP BY sede
      ORDER BY cantidad DESC
      LIMIT 10
    `);

    console.log('\n📋 Distribución por sede:');
    sedes.forEach(sede => {
      console.log(`   ${sede.sede}: ${sede.cantidad} empleados`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

updateEmpleadosSedes();

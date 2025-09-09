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

async function updateInventoryFromCSV() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`📂 Leyendo archivo: ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Saltar el header
    const dataLines = lines.slice(1);
    console.log(`📊 Total registros a procesar: ${dataLines.length}\n`);

    let updated = 0;
    let notFound = 0;
    let errors = 0;

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

        const codigoEFC = values[0];
        const empleadoId = values[26] ? parseInt(values[26]) : null;

        if (!codigoEFC) continue;

        if (empleadoId && !isNaN(empleadoId)) {
          // Verificar si el empleado existe
          const { rows: empleadoExists } = await client.query(
            'SELECT id FROM empleado WHERE id = $1',
            [empleadoId]
          );

          if (empleadoExists.length === 0) {
            console.log(`⚠️ Empleado ${empleadoId} no existe para ${codigoEFC}`);
            continue;
          }

          // Actualizar el registro
          const { rowCount } = await client.query(
            'UPDATE inventory SET "empleadoId" = $1 WHERE "codigoEFC" = $2',
            [empleadoId, codigoEFC]
          );

          if (rowCount > 0) {
            console.log(`✅ ${codigoEFC} -> empleadoId: ${empleadoId}`);
            updated++;
          } else {
            console.log(`❌ No se encontró en BD: ${codigoEFC}`);
            notFound++;
          }
        } else {
          console.log(`⚠️ Sin empleadoId válido: ${codigoEFC}`);
        }

        // Mostrar progreso cada 50 registros
        if ((index + 1) % 50 === 0) {
          console.log(`📊 Progreso: ${index + 1}/${dataLines.length} procesados`);
        }

      } catch (error) {
        console.error(`❌ Error en línea ${index + 2}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumen de actualización:');
    console.log(`✅ Registros actualizados: ${updated}`);
    console.log(`❌ Registros no encontrados: ${notFound}`);
    console.log(`⚠️ Errores: ${errors}`);

    // Verificar el resultado final
    const { rows: [countWithEmpleado] } = await client.query(`
      SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NOT NULL
    `);
    const { rows: [countTotal] } = await client.query(`
      SELECT COUNT(*) FROM inventory
    `);

    console.log(`\n📊 Estado final:`);
    console.log(`📋 Total registros en inventory: ${countTotal.count}`);
    console.log(`👥 Registros con empleado asignado: ${countWithEmpleado.count}`);
    console.log(`❌ Registros sin empleado: ${countTotal.count - countWithEmpleado.count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

updateInventoryFromCSV();

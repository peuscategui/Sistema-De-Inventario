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

function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

function cleanValue(val) {
  if (!val || val.trim() === 'No aplica' || val.trim() === '-' || val.trim() === '') return null;
  return val.trim();
}

function cleanPrice(price) {
  if (!price) return null;
  return parseFloat(price.replace(/[$,\s]/g, '').replace(',', '.'));
}

async function loadNewInventory() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo CSV actualizado
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`📂 Leyendo archivo: ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Saltar el header
    const dataLines = lines.slice(1);
    console.log(`📊 Total registros a procesar: ${dataLines.length}\n`);

    let successful = 0;
    let failed = 0;
    let skipped = 0;
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

        const codigoEFC = values[0];
        const empleadoId = values[values.length - 1] ? parseInt(values[values.length - 1]) : null;

        if (!codigoEFC) continue;

        // Verificar si el registro ya existe
        const { rows: existingRecord } = await client.query(
          'SELECT id FROM inventory WHERE "codigoEFC" = $1',
          [codigoEFC]
        );

        if (existingRecord.length > 0) {
          console.log(`⏭️ Saltando ${codigoEFC}: ya existe`);
          skipped++;
          continue;
        }

        // Verificar si el empleado existe
        if (empleadoId && !isNaN(empleadoId)) {
          const { rows: empleadoExists } = await client.query(
            'SELECT id FROM empleado WHERE id = $1',
            [empleadoId]
          );

          if (empleadoExists.length === 0) {
            console.log(`⚠️ Empleado ${empleadoId} no existe para ${codigoEFC}`);
            continue;
          }
        }

        // Determinar clasificacionId basado en el código
        let clasificacionId = 1; // Desktop por defecto
        if (codigoEFC.startsWith('LT-')) {
          clasificacionId = 6; // Laptop
        } else if (codigoEFC.startsWith('PC-')) {
          clasificacionId = 1; // Desktop
        }

        const query = `
          INSERT INTO inventory (
            "codigoEFC", marca, modelo, descripcion, serie, procesador,
            anio, ram, "discoDuro", "sistemaOperativo", status, estado,
            "ubicacionEquipo", "qUsuarios", condicion, repotenciadas,
            "clasificacionObsolescencia", "clasificacionRepotenciadas",
            "motivoCompra", proveedor, factura, "anioCompra", observaciones,
            fecha_compra, "precioUnitarioSinIgv", "clasificacionId", "empleadoId"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
          )
        `;

        const params = [
          values[0],                                    // codigoEFC
          values[1],                                    // marca
          values[2],                                    // modelo
          values[3],                                    // descripcion
          values[4],                                    // serie
          values[5],                                    // procesador
          values[6] ? parseInt(values[6]) : null,       // anio
          values[7],                                    // ram
          values[8],                                    // discoDuro
          values[9],                                    // sistemaOperativo
          values[10] || 'libre',                        // status
          values[11],                                   // estado
          values[12],                                   // ubicacionEquipo
          values[13] ? parseInt(values[13]) : null,     // qUsuarios
          values[14],                                   // condicion
          values[15] === 'SI',                          // repotenciadas
          values[16],                                   // clasificacionObsolescencia
          values[17],                                   // clasificacionRepotenciadas
          values[18],                                   // motivoCompra
          values[19],                                   // proveedor
          values[20],                                   // factura
          values[21] ? parseInt(values[21]) : null,     // anioCompra
          values[22],                                   // observaciones
          values[23] ? excelDateToJSDate(parseInt(values[23])) : null, // fecha_compra
          cleanPrice(values[24]),                       // precioUnitarioSinIgv
          clasificacionId,                              // clasificacionId
          empleadoId                                    // empleadoId
        ];

        await client.query(query, params);
        successful++;
        console.log(`✅ ${codigoEFC} cargado (${values[1]} ${values[2]}) - empleadoId: ${empleadoId}`);

        // Mostrar progreso cada 10 registros
        if (successful % 10 === 0) {
          console.log(`📊 Progreso: ${successful} registros cargados`);
        }

      } catch (error) {
        failed++;
        errors.push({
          line: index + 2,
          data: line,
          error: error.message
        });
        console.error(`❌ Error en línea ${index + 2}: ${error.message}`);
      }
    }

    console.log('\n📊 Resumen de la carga:');
    console.log(`✅ Registros cargados: ${successful}`);
    console.log(`⏭️ Registros saltados (ya existían): ${skipped}`);
    console.log(`❌ Registros fallidos: ${failed}`);

    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errors.forEach(err => {
        console.log(`Línea ${err.line}: ${err.error}`);
      });
    }

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

loadNewInventory();

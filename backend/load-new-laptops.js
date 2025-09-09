const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

function parseExcelDate(excelDate) {
  if (!excelDate || excelDate === 'No aplica' || excelDate === '') return null;
  const numDate = parseInt(excelDate);
  if (isNaN(numDate)) return null;
  const date = new Date((numDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

function cleanValue(val) {
  if (!val || val.trim() === '' || val.trim() === 'No aplica') return null;
  return val.trim();
}

function cleanPrice(price) {
  if (!price || price === 'No aplica' || price === '') return null;
  const cleaned = price.toString().replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function loadNewLaptops() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    const csvPath = require('path').join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);

    const fs = require('fs');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Saltar la primera línea (header) y procesar solo las líneas de datos
    const dataLines = lines.slice(1);
    console.log(`📊 Total registros a procesar: ${dataLines.length}`);

    let loadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const [index, line] of dataLines.entries()) {
      try {
        // Parsear CSV manualmente
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
        const marca = values[1];
        const modelo = values[2];
        const descripcion = values[3];
        const serie = values[4];
        const procesador = values[5];
        const anio = parseInt(values[6]) || null;
        const ram = values[7];
        const discoDuro = values[8];
        const sistemaOperativo = values[9];
        const status = values[10];
        const estado = values[11];
        const ubicacionEquipo = values[12];
        const qUsuarios = parseInt(values[13]) || null;
        const condicion = values[14];
        const repotenciadas = values[15];
        const clasificacionObsolescencia = values[16];
        const clasificacionRepotenciadas = values[17];
        const motivoCompra = values[18];
        const proveedor = values[19];
        const factura = values[20];
        const anioCompra = parseInt(values[21]) || null;
        const observaciones = values[22];
        const fecha_compra = parseExcelDate(values[23]);
        const precioUnitarioSinIgv = cleanPrice(values[24]);
        const clasificacionId = parseInt(values[25]) || null;
        const empleadoId = values[26] && values[26].trim() !== '' ? parseInt(values[26]) : null;

        if (!codigoEFC || !marca || !modelo) {
          console.warn(`⚠️ Saltando línea ${index + 2}: datos incompletos`);
          skippedCount++;
          continue;
        }

        // Verificar si ya existe
        const { rows: existingRecord } = await client.query(
          'SELECT "codigoEFC" FROM inventory WHERE "codigoEFC" = $1',
          [codigoEFC]
        );

        if (existingRecord.length > 0) {
          console.log(`⏭️ Saltando ${codigoEFC}: ya existe`);
          skippedCount++;
          continue;
        }

        // Verificar si el empleado existe
        if (empleadoId && !isNaN(empleadoId)) {
          const { rows: empleadoExists } = await client.query(
            'SELECT id FROM empleado WHERE id = $1',
            [empleadoId]
          );

          if (empleadoExists.length === 0) {
            console.log(`⚠️ Empleado ${empleadoId} no existe para ${codigoEFC}, asignando null`);
            empleadoId = null;
          }
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
          codigoEFC, marca, modelo, descripcion, serie, procesador,
          anio, ram, discoDuro, sistemaOperativo, status, estado,
          ubicacionEquipo, qUsuarios, condicion, repotenciadas,
          clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra,
          proveedor, factura, anioCompra, observaciones,
          fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId
        ];

        await client.query(query, params);
        console.log(`✅ ${codigoEFC} cargado - ${marca} ${modelo} - empleadoId: ${empleadoId || 'null'}`);
        loadedCount++;

      } catch (error) {
        console.error(`❌ Error en línea ${index + 2}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumen de la carga:`);
    console.log(`✅ Registros cargados: ${loadedCount}`);
    console.log(`⏭️ Registros saltados: ${skippedCount}`);
    console.log(`❌ Registros fallidos: ${errorCount}`);

    // Verificar estado final
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Estado final:`);
    console.log(`📋 Total registros en inventory: ${count.count}`);

    const { rows: [assignedCount] } = await client.query('SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NOT NULL');
    const { rows: [unassignedCount] } = await client.query('SELECT COUNT(*) FROM inventory WHERE "empleadoId" IS NULL');
    
    console.log(`👥 Registros con empleado asignado: ${assignedCount.count}`);
    console.log(`❌ Registros sin empleado: ${unassignedCount.count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

loadNewLaptops();

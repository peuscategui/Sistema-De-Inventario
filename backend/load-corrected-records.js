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

async function loadCorrectedRecords() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Cargar los registros que están bien formateados pero que fallaron
    const correctedRecords = [
      {
        codigoEFC: 'SWTPLINK0002',
        marca: 'TP-LINK',
        modelo: 'TL-SG1008P',
        serie: null,
        s_n: 'No aplica',
        mac: 'No aplica',
        año: 2025,
        ram: 'No aplica',
        disco: 'No aplica',
        procesador: 'No aplica',
        ubicacion: 'AREQUIPA',
        estado: 'OPERATIVO',
        sede: 'AREQUIPA',
        clasificacionId: 1,
        estado_operativo: 'OPERATIVO',
        proveedor: 'INFOCOM BUSSINESS S.A.C',
        factura: 'F005-4239',
        año_compra: 2024,
        fecha_compra: parseExcelDate('45398'),
        precio: 173.73,
        empleadoId: 354
      },
      {
        codigoEFC: 'SWHPOFFCON001',
        marca: 'HP',
        modelo: 'OfficeConnect 1920S',
        serie: null,
        s_n: 'No aplica',
        mac: 'No aplica',
        año: 2019,
        ram: 'No aplica',
        disco: 'No aplica',
        procesador: 'No aplica',
        ubicacion: 'SURQUILLO',
        estado: 'OPERATIVO',
        sede: 'SURQUILLO',
        clasificacionId: 1,
        estado_operativo: 'OPERATIVO',
        proveedor: 'INTCOMEX',
        factura: 'F00L-00312266',
        año_compra: 2019,
        fecha_compra: parseExcelDate('43699'),
        precio: 554.1,
        empleadoId: 13
      },
      {
        codigoEFC: 'SPEAKLOGI0001',
        marca: 'LOGITECH',
        modelo: 'Mobile Speakerphone P710e',
        serie: '2116GG00U5H8',
        s_n: 'No aplica',
        mac: 'No aplica',
        año: 2022,
        ram: 'No aplica',
        disco: 'No aplica',
        procesador: 'No aplica',
        ubicacion: 'SURQUILLO',
        estado: 'OPERATIVO',
        sede: 'SURQUILLO',
        clasificacionId: 1,
        estado_operativo: 'OPERATIVA',
        proveedor: 'PROCONT',
        factura: 'F001-814',
        año_compra: 2022,
        fecha_compra: parseExcelDate('44883'),
        precio: 100,
        empleadoId: 26
      },
      {
        codigoEFC: 'CAMLOGIBRI001',
        marca: 'LOGITECH',
        modelo: 'Brio',
        serie: null,
        s_n: 'No aplica',
        mac: 'No aplica',
        año: 2022,
        ram: 'No aplica',
        disco: 'No aplica',
        procesador: 'No aplica',
        ubicacion: 'SURQUILLO',
        estado: 'OPERATIVO',
        sede: 'SURQUILLO',
        clasificacionId: 1,
        estado_operativo: 'OPERATIVA',
        proveedor: 'PROCONT',
        factura: 'F001-814',
        año_compra: 2022,
        fecha_compra: parseExcelDate('44883'),
        precio: 150,
        empleadoId: 167
      }
    ];

    console.log(`\n🔧 Cargando ${correctedRecords.length} registros corregidos...`);

    let loadedCount = 0;
    let skippedCount = 0;

    for (const record of correctedRecords) {
      try {
        // Verificar si ya existe
        const checkQuery = 'SELECT "codigoEFC" FROM inventory WHERE "codigoEFC" = $1';
        const checkResult = await client.query(checkQuery, [record.codigoEFC]);
        
        if (checkResult.rows.length > 0) {
          console.log(`⏭️ Saltando ${record.codigoEFC}: ya existe`);
          skippedCount++;
          continue;
        }

        const query = `
          INSERT INTO inventory (
            "codigoEFC", marca, modelo, serie, "s_n", mac, año, ram, disco, procesador,
            ubicacion, estado, sede, "clasificacionId", estado_operativo, proveedor,
            factura, año_compra, fecha_compra, precio, "empleadoId"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          )
        `;

        const params = [
          record.codigoEFC, record.marca, record.modelo, record.serie, record.s_n,
          record.mac, record.año, record.ram, record.disco, record.procesador,
          record.ubicacion, record.estado, record.sede, record.clasificacionId,
          record.estado_operativo, record.proveedor, record.factura, record.año_compra,
          record.fecha_compra, record.precio, record.empleadoId
        ];

        await client.query(query, params);
        console.log(`✅ ${record.codigoEFC} cargado - ${record.modelo} - empleadoId: ${record.empleadoId}`);
        loadedCount++;

      } catch (error) {
        console.error(`❌ Error cargando ${record.codigoEFC}: ${error.message}`);
      }
    }

    console.log(`\n📊 Resumen de la carga:`);
    console.log(`✅ Registros cargados: ${loadedCount}`);
    console.log(`⏭️ Registros saltados: ${skippedCount}`);

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

loadCorrectedRecords();

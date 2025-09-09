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

async function loadPendingRecords() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Cargar los 4 registros pendientes específicos
    const pendingRecords = [
      {
        codigoEFC: 'SWTPLINK0002',
        marca: 'TP-LINK',
        modelo: 'TL-SG1008P',
        descripcion: null,
        serie: null,
        procesador: 'No aplica',
        anio: 2025,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'AREQUIPA',
        estado: 'OPERATIVO',
        ubicacionEquipo: 'AREQUIPA',
        qUsuarios: 1,
        condicion: 'OPERATIVO',
        repotenciadas: null,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'INFOCOM BUSSINESS S.A.C',
        factura: 'F005-4239',
        anioCompra: 2024,
        observaciones: null,
        fecha_compra: parseExcelDate('45398'),
        precioUnitarioSinIgv: 173.73,
        clasificacionId: 1,
        empleadoId: 354
      },
      {
        codigoEFC: 'SWHPOFFCON001',
        marca: 'HP',
        modelo: 'OfficeConnect 1920S',
        descripcion: null,
        serie: null,
        procesador: 'No aplica',
        anio: 2019,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'SURQUILLO',
        estado: 'OPERATIVO',
        ubicacionEquipo: 'SURQUILLO',
        qUsuarios: 1,
        condicion: 'OPERATIVO',
        repotenciadas: null,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'INTCOMEX',
        factura: 'F00L-00314266',
        anioCompra: 2019,
        observaciones: null,
        fecha_compra: parseExcelDate('43706'),
        precioUnitarioSinIgv: 554.1,
        clasificacionId: 1,
        empleadoId: 13
      },
      {
        codigoEFC: 'SPEAKLOGI0001',
        marca: 'LOGITECH',
        modelo: 'Mobile Speakerphone P710e',
        descripcion: null,
        serie: '2116GG00U5H8',
        procesador: 'No aplica',
        anio: 2022,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'SURQUILLO',
        estado: 'OPERATIVO',
        ubicacionEquipo: 'SURQUILLO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        repotenciadas: null,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'PROCONT',
        factura: 'F001-814',
        anioCompra: 2022,
        observaciones: null,
        fecha_compra: parseExcelDate('44883'),
        precioUnitarioSinIgv: 100,
        clasificacionId: 1,
        empleadoId: 167
      },
      {
        codigoEFC: 'CAMLOGIBRI001',
        marca: 'LOGITECH',
        modelo: 'Brio',
        descripcion: null,
        serie: null,
        procesador: 'No aplica',
        anio: 2022,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'SURQUILLO',
        estado: 'OPERATIVO',
        ubicacionEquipo: 'SURQUILLO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        repotenciadas: null,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'PROCONT',
        factura: 'F001-814',
        anioCompra: 2022,
        observaciones: null,
        fecha_compra: parseExcelDate('44883'),
        precioUnitarioSinIgv: 150,
        clasificacionId: 1,
        empleadoId: 27
      }
    ];

    console.log(`\n🔧 Cargando ${pendingRecords.length} registros pendientes...`);

    let loadedCount = 0;
    let skippedCount = 0;

    for (const record of pendingRecords) {
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
          record.codigoEFC, record.marca, record.modelo, record.descripcion, record.serie, record.procesador,
          record.anio, record.ram, record.discoDuro, record.sistemaOperativo, record.status, record.estado,
          record.ubicacionEquipo, record.qUsuarios, record.condicion, record.repotenciadas,
          record.clasificacionObsolescencia, record.clasificacionRepotenciadas, record.motivoCompra,
          record.proveedor, record.factura, record.anioCompra, record.observaciones,
          record.fecha_compra, record.precioUnitarioSinIgv, record.clasificacionId, record.empleadoId
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

loadPendingRecords();

const { Client } = require('pg');

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

async function loadSpecificCameras() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Registros específicos que quieres cargar
    const recordsToLoad = [
      {
        codigoEFC: 'Cam Externa Estacionamiento1',
        marca: 'EZVIZ',
        modelo: 'EZVIZ CS-H4-R201',
        descripcion: 'Cam Externa Estacionamiento',
        serie: 'BE4214445',
        procesador: 'No aplica',
        anio: 2025,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'Asignado',
        estado: 'Operativo',
        ubicacionEquipo: 'Cam Externa Estacionamiento',
        qUsuarios: 1,
        condicion: 'Operativo',
        repotenciadas: false,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'GRUPO ANKU',
        factura: 'F001 - 00009093',
        anioCompra: 2025,
        observaciones: null,
        fecha_compra: excelDateToJSDate(45720),
        precioUnitarioSinIgv: null,
        clasificacionId: 29, // Cámara
        empleadoId: 5
      },
      {
        codigoEFC: 'Cam Colina2',
        marca: 'EZVIZ',
        modelo: 'EZVIZ CS-H4-R201',
        descripcion: 'Cam Colina',
        serie: 'BE4214527',
        procesador: 'No aplica',
        anio: 2025,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'Asignado',
        estado: 'Operativo',
        ubicacionEquipo: 'Cam Colina',
        qUsuarios: 1,
        condicion: 'Operativo',
        repotenciadas: false,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'SEGO',
        factura: 'F120 - 00000229',
        anioCompra: 2025,
        observaciones: null,
        fecha_compra: excelDateToJSDate(45733),
        precioUnitarioSinIgv: null,
        clasificacionId: 29, // Cámara
        empleadoId: 5
      },
      {
        codigoEFC: 'Cam Colina3',
        marca: 'EZVIZ',
        modelo: 'EZVIZ CS-H4-R201',
        descripcion: 'Cam Colina',
        serie: 'BE4214503',
        procesador: 'No aplica',
        anio: 2025,
        ram: 'No aplica',
        discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica',
        status: 'Asignado',
        estado: 'Operativo',
        ubicacionEquipo: 'Cam Colina',
        qUsuarios: 1,
        condicion: 'Operativo',
        repotenciadas: false,
        clasificacionObsolescencia: null,
        clasificacionRepotenciadas: null,
        motivoCompra: null,
        proveedor: 'SEGO',
        factura: 'F120 - 00000229',
        anioCompra: 2025,
        observaciones: null,
        fecha_compra: excelDateToJSDate(45733),
        precioUnitarioSinIgv: null,
        clasificacionId: 29, // Cámara
        empleadoId: 5
      }
    ];

    console.log('📥 Cargando registros específicos de cámaras...\n');

    let successful = 0;
    let failed = 0;

    for (const record of recordsToLoad) {
      try {
        // Verificar si el registro ya existe
        const { rows: existingRecord } = await client.query(
          'SELECT id FROM inventory WHERE "codigoEFC" = $1',
          [record.codigoEFC]
        );

        if (existingRecord.length > 0) {
          console.log(`⏭️ Saltando ${record.codigoEFC}: ya existe`);
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
          record.codigoEFC,
          record.marca,
          record.modelo,
          record.descripcion,
          record.serie,
          record.procesador,
          record.anio,
          record.ram,
          record.discoDuro,
          record.sistemaOperativo,
          record.status,
          record.estado,
          record.ubicacionEquipo,
          record.qUsuarios,
          record.condicion,
          record.repotenciadas,
          record.clasificacionObsolescencia,
          record.clasificacionRepotenciadas,
          record.motivoCompra,
          record.proveedor,
          record.factura,
          record.anioCompra,
          record.observaciones,
          record.fecha_compra,
          record.precioUnitarioSinIgv,
          record.clasificacionId,
          record.empleadoId
        ];

        await client.query(query, params);
        successful++;
        console.log(`✅ ${record.codigoEFC} cargado exitosamente`);

      } catch (error) {
        failed++;
        console.error(`❌ Error cargando ${record.codigoEFC}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de la carga:');
    console.log(`✅ Registros cargados: ${successful}`);
    console.log(`❌ Registros fallidos: ${failed}`);

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

loadSpecificCameras();

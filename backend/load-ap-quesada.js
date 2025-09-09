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

async function loadApQuesada() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar si existe algún registro con ese nombre
    const { rows: existingRecords } = await client.query(
      'SELECT "codigoEFC", "empleadoId" FROM inventory WHERE "codigoEFC" LIKE \'%Quesada%\''
    );

    console.log('🔍 Registros existentes con "Quesada":');
    existingRecords.forEach(record => {
      console.log(`   ${record.codigoEFC} - empleadoId: ${record.empleadoId}`);
    });

    // Cargar el registro Ap-Of.Quesada
    const record = {
      codigoEFC: 'Ap-Of.Quesada',
      marca: 'UBIQUITI',
      modelo: 'AC PRO',
      descripcion: 'Oficina Quesada',
      serie: 'No aplica',
      procesador: 'No aplica',
      anio: 2019,
      ram: 'No aplica',
      discoDuro: 'No aplica',
      sistemaOperativo: 'No aplica',
      status: 'Asignado',
      estado: 'Operativo',
      ubicacionEquipo: 'Oficina Quesada',
      qUsuarios: 2,
      condicion: 'Obsoleto',
      repotenciadas: false,
      clasificacionObsolescencia: null,
      clasificacionRepotenciadas: null,
      motivoCompra: null,
      proveedor: null,
      factura: null,
      anioCompra: null,
      observaciones: null,
      fecha_compra: null,
      precioUnitarioSinIgv: null,
      clasificacionId: 16, // Access Point
      empleadoId: 47
    };

    console.log('\n📥 Intentando cargar Ap-Of.Quesada...');

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
    console.log('✅ Ap-Of.Quesada cargado exitosamente');

    // Verificar el resultado final
    const { rows: [countTotal] } = await client.query(`
      SELECT COUNT(*) FROM inventory
    `);

    console.log(`\n📊 Total registros en inventory: ${countTotal.count}`);

  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️ El registro Ap-Of.Quesada ya existe en la base de datos');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await client.end();
  }
}

loadApQuesada();

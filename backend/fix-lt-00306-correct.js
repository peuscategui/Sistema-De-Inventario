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

async function fixLT00306Correct() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Eliminar el registro mal cargado
    console.log('🗑️ Eliminando registro LT-00306 mal cargado...');
    const { rowCount: deleted } = await client.query(
      'DELETE FROM inventory WHERE "codigoEFC" LIKE \'LT-00306%\''
    );
    console.log(`✅ Registros eliminados: ${deleted}`);

    // Cargar el registro correctamente
    console.log('\n📥 Cargando registro LT-00306 correctamente...');
    
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
      'LT-00306',                                    // codigoEFC
      'DELL',                                        // marca
      'LATITUDE 3550',                              // modelo
      'LAPTOP LT-00306 LATITUDE 3550',              // descripcion
      'H9MH094',                                    // serie
      'i5-1335U',                                   // procesador
      2025,                                         // anio
      '16 GB',                                      // ram
      '480 GB - SSD',                              // discoDuro
      'Windows 11 Pro',                            // sistemaOperativo
      'SURQUILLO',                                 // status
      'ASIGNADA',                                  // estado
      'SURQUILLO',                                 // ubicacionEquipo
      1,                                           // qUsuarios
      'OPERATIVA',                                 // condicion
      false,                                       // repotenciadas
      null,                                        // clasificacionObsolescencia
      null,                                        // clasificacionRepotenciadas
      null,                                        // motivoCompra
      'INGRAM MICRO S.A.C',                        // proveedor
      'F007-0602597',                              // factura
      2025,                                        // anioCompra
      null,                                        // observaciones
      excelDateToJSDate(45862),                    // fecha_compra
      cleanPrice('643'),                           // precioUnitarioSinIgv
      6,                                           // clasificacionId (6 = Laptop)
      414                                          // empleadoId
    ];

    await client.query(query, params);
    console.log('✅ LT-00306 cargado correctamente con empleadoId: 414');

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

    // Verificar el registro específico
    const { rows: [record] } = await client.query(`
      SELECT "codigoEFC", marca, modelo, "empleadoId" 
      FROM inventory 
      WHERE "codigoEFC" = 'LT-00306'
    `);
    
    if (record) {
      console.log(`\n✅ Verificación del registro LT-00306:`);
      console.log(`   Código: ${record.codigoEFC}`);
      console.log(`   Marca: ${record.marca}`);
      console.log(`   Modelo: ${record.modelo}`);
      console.log(`   EmpleadoId: ${record.empleadoId}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixLT00306Correct();

const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function loadInventoryOnly() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n💻 Cargando Inventory...');
    
    // Insertar un registro simple primero
    await client.query(`
      INSERT INTO inventory (
        id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro,
        sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas,
        clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura,
        anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      ON CONFLICT (id) DO NOTHING
    `, [
      1, 'PC-001', 'Dell', 'OptiPlex 7090', 'PC de Escritorio para oficina',
      'SN123456', 'Intel i5-10500', 2021, '8GB', '256GB SSD',
      'Windows 10', 'libre', 'Activo', 'Oficina 101',
      1, 'Bueno', false, 'No obsoleto', 'No repotenciado', 'Reemplazo equipo anterior',
      'Dell Perú', 'F001-2021', 2021, 'Equipo nuevo',
      '2021-01-15', '1800.00', 1, 1
    ]);
    
    console.log('✅ Primer registro de inventory cargado');

    // Insertar segundo registro
    await client.query(`
      INSERT INTO inventory (
        id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro,
        sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas,
        clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura,
        anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      ON CONFLICT (id) DO NOTHING
    `, [
      2, 'PC-002', 'HP', 'EliteDesk 800', 'PC de Escritorio para desarrollo',
      'SN789012', 'Intel i7-10700', 2021, '16GB', '512GB SSD',
      'Windows 10', 'asignado', 'Activo', 'Oficina 102',
      1, 'Excelente', false, 'No obsoleto', 'No repotenciado', 'Desarrollo de software',
      'HP Perú', 'F002-2021', 2021, 'Equipo para desarrollador',
      '2021-02-20', '2200.00', 1, 2
    ]);
    
    console.log('✅ Segundo registro de inventory cargado');

    console.log('\n🎉 ¡Inventory cargado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la carga de inventory:', error.message);
  } finally {
    await client.end();
  }
}

loadInventoryOnly(); 
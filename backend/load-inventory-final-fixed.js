const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function loadInventoryFinalFixed() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla inventory primero
    console.log('\n🧹 Limpiando tabla inventory...');
    await client.query('DELETE FROM inventory');
    console.log('✅ Tabla inventory limpiada');

    // Cargar desde inventory_ejemplo_realista.csv
    console.log('\n💻 Cargando inventory...');
    const inventoryPath = path.join(__dirname, '..', 'inventory_ejemplo_realista.csv');
    
    if (fs.existsSync(inventoryPath)) {
      const csvContent = fs.readFileSync(inventoryPath, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Saltar header
      
      let count = 0;
      for (const line of lines) {
        if (line.trim()) {
          const columns = line.split(',');
          if (columns.length >= 26) {
            const [codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro, sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas, clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura, anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId] = columns;
            
            // Generar ID automáticamente
            const id = count + 1;
            
            // Validar año
            const anioNum = anio && anio.trim() ? parseInt(anio) : null;
            const anioCompraNum = anioCompra && anioCompra.trim() ? parseInt(anioCompra) : null;
            const clasificacionIdNum = clasificacionId && clasificacionId.trim() ? parseInt(clasificacionId) : null;
            const empleadoIdNum = empleadoId && empleadoId.trim() ? parseInt(empleadoId) : null;
            
            // Validar fecha de compra
            let fechaCompra = null;
            if (fecha_compra && fecha_compra.trim() && fecha_compra.trim() !== '45737') {
              fechaCompra = '2021-01-01'; // Fecha por defecto
            }
            
            await client.query(`
              INSERT INTO inventory (
                id, "codigoEFC", marca, modelo, descripcion, serie, procesador, anio, ram, "discoDuro",
                "sistemaOperativo", status, estado, "ubicacionEquipo", "qUsuarios", condicion, repotenciadas,
                "clasificacionObsolescencia", "clasificacionRepotenciadas", "motivoCompra", proveedor, factura,
                "anioCompra", observaciones, "fecha_compra", "precioUnitarioSinIgv", "clasificacionId", "empleadoId"
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
            `, [
              id, 
              codigoEFC || '', 
              marca || '', 
              modelo || '', 
              descripcion || '', 
              serie || '', 
              procesador || '',
              anioNum, 
              ram || '', 
              discoDuro || '',
              sistemaOperativo || 'Windows 10', 
              status || 'libre', 
              estado || 'Activo', 
              ubicacionEquipo || 'Oficina', 
              qUsuarios ? parseInt(qUsuarios) : 1, 
              condicion || 'Bueno', 
              repotenciadas === 'true',
              clasificacionObsolescencia || 'No obsoleto', 
              clasificacionRepotenciadas || 'No repotenciado', 
              motivoCompra || 'Compra regular', 
              proveedor || 'Proveedor', 
              factura || 'F001',
              anioCompraNum, 
              observaciones || 'Equipo cargado desde CSV', 
              fechaCompra,
              precioUnitarioSinIgv || '1000.00', 
              clasificacionIdNum, 
              empleadoIdNum
            ]);
            count++;
            
            console.log(`Cargado: ID ${id} - ${codigoEFC} - ${marca} ${modelo}`);
          }
        }
      }
      console.log(`\n✅ ${count} items de inventory cargados exitosamente`);
    } else {
      console.log('❌ No se encontró el archivo inventory_ejemplo_realista.csv');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

loadInventoryFinalFixed(); 
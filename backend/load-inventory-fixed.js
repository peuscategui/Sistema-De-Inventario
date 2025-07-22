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

async function loadInventoryFixed() {
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
          if (columns.length >= 10) {
            const [id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro] = columns;
            
            await client.query(`
              INSERT INTO inventory (
                id, "codigoEFC", marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro,
                sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas,
                clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura,
                anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
            `, [
              parseInt(id), 
              codigoEFC, 
              marca, 
              modelo, 
              descripcion, 
              serie, 
              procesador,
              anio ? parseInt(anio) : null, 
              ram, 
              discoDuro,
              'Windows 10', 
              'libre', 
              'Activo', 
              'Oficina', 
              1, 
              'Bueno', 
              false,
              'No obsoleto', 
              'No repotenciado', 
              'Compra regular', 
              'Proveedor', 
              'F001',
              anio ? parseInt(anio) : null, 
              'Equipo cargado desde CSV', 
              '2021-01-01',
              '1000.00', 
              1, 
              1
            ]);
            count++;
            
            if (count % 50 === 0) {
              console.log(`Cargados ${count} items de inventory...`);
            }
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

loadInventoryFixed(); 
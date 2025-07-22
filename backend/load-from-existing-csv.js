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

async function loadFromExistingCSV() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Cargar desde clasificaciones_carga_con_id.csv
    console.log('\n📋 1. Cargando Clasificaciones...');
    const clasificacionesPath = path.join(__dirname, '..', 'clasificaciones_carga_con_id.csv');
    if (fs.existsSync(clasificacionesPath)) {
      const csvContent = fs.readFileSync(clasificacionesPath, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Saltar header
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion] = line.split(',');
          await client.query(`
            INSERT INTO clasificacion (id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
          `, [parseInt(id), familia, sub_familia, tipo_equipo, vida_util, valor_reposicion ? parseFloat(valor_reposicion) : null]);
        }
      }
      console.log('✅ Clasificaciones cargadas');
    }

    // 2. Cargar desde empleados_carga_con_id.csv
    console.log('\n👥 2. Cargando Empleados...');
    const empleadosPath = path.join(__dirname, '..', 'empleados_carga_con_id.csv');
    if (fs.existsSync(empleadosPath)) {
      const csvContent = fs.readFileSync(empleadosPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, nombre, cargo, gerencia, sede] = line.split(',');
          await client.query(`
            INSERT INTO empleado (id, nombre, cargo, gerencia, sede)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [parseInt(id), nombre, cargo, gerencia, sede]);
        }
      }
      console.log('✅ Empleados cargados');
    }

    // 3. Cargar desde inventory_ejemplo_realista.csv
    console.log('\n💻 3. Cargando Inventory...');
    const inventoryPath = path.join(__dirname, '..', 'inventory_ejemplo_realista.csv');
    if (fs.existsSync(inventoryPath)) {
      const csvContent = fs.readFileSync(inventoryPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const columns = line.split(',');
          if (columns.length >= 10) {
            const [id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro] = columns;
            
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
              parseInt(id), codigoEFC, marca, modelo, descripcion, serie, procesador,
              anio ? parseInt(anio) : null, ram, discoDuro,
              'Windows 10', 'libre', 'Activo', 'Oficina', 1, 'Bueno', false,
              'No obsoleto', 'No repotenciado', 'Compra regular', 'Proveedor', 'F001',
              anio ? parseInt(anio) : null, 'Equipo cargado desde CSV', '2021-01-01',
              '1000.00', 1, 1
            ]);
          }
        }
      }
      console.log('✅ Inventory cargado');
    }

    console.log('\n🎉 ¡Carga de datos completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error.message);
  } finally {
    await client.end();
  }
}

loadFromExistingCSV(); 
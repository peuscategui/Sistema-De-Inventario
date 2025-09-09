const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

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
  if (!val || val === 'No aplica' || val === '-' || val === '') return null;
  // Limpiar valores de precio (quitar $ y comas)
  if (typeof val === 'string' && val.includes('$')) {
    return val.replace('$', '').replace(',', '').trim();
  }
  return val.trim();
}

async function loadInventory() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla inventory primero
    console.log('\n🧹 Limpiando tabla inventory...');
    await client.query('DELETE FROM inventory');
    await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
    console.log('✅ Tabla inventory limpiada');

    // Leer y parsear el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Total registros a cargar: ${records.length}`);
    console.log('\n📥 Cargando inventario...');
    
    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const [index, record] of records.entries()) {
      try {
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
          cleanValue(record.codigoEFC),
          cleanValue(record.marca),
          cleanValue(record.modelo),
          cleanValue(record.descripcion),
          cleanValue(record.serie),
          cleanValue(record.procesador),
          cleanValue(record.anio) ? parseInt(record.anio) : null,
          cleanValue(record.ram),
          cleanValue(record.discoDuro),
          cleanValue(record.sistemaOperativo),
          cleanValue(record.status) || 'libre',
          cleanValue(record.estado),
          cleanValue(record.ubicacionEquipo),
          cleanValue(record.qUsuarios) ? parseInt(record.qUsuarios) : null,
          cleanValue(record.condicion),
          false, // repotenciadas default false
          cleanValue(record.clasificacionObsolescencia),
          cleanValue(record.clasificacionRepotenciadas),
          cleanValue(record.motivoCompra),
          cleanValue(record.proveedor),
          cleanValue(record.factura),
          cleanValue(record.anioCompra) ? parseInt(record.anioCompra) : null,
          cleanValue(record.observaciones),
          cleanValue(record.fecha_compra) ? excelDateToJSDate(parseInt(record.fecha_compra)) : null,
          cleanValue(record.precioUnitarioSinIgv),
          cleanValue(record.clasificacionId) ? parseInt(record.clasificacionId) : null,
          cleanValue(record.empleadoId) ? parseInt(record.empleadoId) : null
        ];

        await client.query(query, params);
        successful++;
        
        // Mostrar progreso cada 10 registros
        if (successful % 10 === 0) {
          console.log(`✅ Progreso: ${successful}/${records.length} registros procesados`);
        }

      } catch (error) {
        failed++;
        errors.push({
          line: index + 2,
          codigo: record.codigoEFC,
          error: error.message
        });
      }
    }

    console.log('\n📊 Resumen de la carga:');
    console.log(`✅ Registros exitosos: ${successful}`);
    console.log(`❌ Registros fallidos: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errors.forEach(err => {
        console.log(`Línea ${err.line} (${err.codigo}): ${err.error}`);
      });
    }

    // Verificar la carga
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Total registros en la base de datos: ${count.count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

loadInventory();

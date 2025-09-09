const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
  // Eliminar espacios al inicio y final
  return val.trim();
}

function cleanPrice(price) {
  if (!price) return null;
  // Eliminar el símbolo $, las comas y los espacios
  return price.replace(/[$,\s]/g, '');
}

function cleanId(id) {
  if (!id) return null;
  // Eliminar cualquier espacio y convertir a entero
  const cleaned = id.toString().trim();
  return parseInt(cleaned);
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

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    // Procesar cada línea
    const dataLines = lines.slice(1);
    console.log(`📊 Total registros a cargar: ${dataLines.length}`);
    console.log('\n📥 Cargando inventario...');

    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const [index, line] of dataLines.entries()) {
      try {
        // Dividir la línea manualmente para manejar valores con comas dentro de comillas
        let values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let char of line) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Añadir el último valor

        // Limpiar los valores
        values = values.map(val => cleanValue(val));

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

        // Encontrar el índice del precio y limpiarlo especialmente
        const precioIndex = headers.findIndex(h => h === 'precioUnitarioSinIgv');
        if (precioIndex >= 0 && values[precioIndex]) {
          values[precioIndex] = cleanPrice(values[precioIndex]);
        }

        // Encontrar y limpiar los IDs
        const clasificacionIdIndex = headers.findIndex(h => h === 'clasificacionId');
        const empleadoIdIndex = headers.findIndex(h => h === 'empleadoId');

        if (clasificacionIdIndex >= 0 && values[clasificacionIdIndex]) {
          values[clasificacionIdIndex] = cleanId(values[clasificacionIdIndex]);
        }
        if (empleadoIdIndex >= 0 && values[empleadoIdIndex]) {
          values[empleadoIdIndex] = cleanId(values[empleadoIdIndex]);
        }

        const params = [
          values[0],                    // codigoEFC
          values[1],                    // marca
          values[2],                    // modelo
          values[3],                    // descripcion
          values[4],                    // serie
          values[5],                    // procesador
          values[6] ? parseInt(values[6]) : null, // anio
          values[7],                    // ram
          values[8],                    // discoDuro
          values[9],                    // sistemaOperativo
          values[10] || 'libre',        // status
          values[11],                   // estado
          values[12],                   // ubicacionEquipo
          values[13] ? parseInt(values[13]) : null, // qUsuarios
          values[14],                   // condicion
          false,                        // repotenciadas (default false)
          values[16],                   // clasificacionObsolescencia
          values[17],                   // clasificacionRepotenciadas
          values[18],                   // motivoCompra
          values[19],                   // proveedor
          values[20],                   // factura
          values[21] ? parseInt(values[21]) : null, // anioCompra
          values[22],                   // observaciones
          values[23] ? excelDateToJSDate(parseInt(values[23])) : null, // fecha_compra
          values[24],                   // precioUnitarioSinIgv (ya limpio)
          values[25],                   // clasificacionId (ya limpio)
          values[26]                    // empleadoId (ya limpio)
        ];

        await client.query(query, params);
        successful++;
        
        // Mostrar progreso cada 10 registros
        if (successful % 10 === 0 || successful === dataLines.length) {
          console.log(`✅ Progreso: ${successful}/${dataLines.length} registros procesados`);
        }

      } catch (error) {
        failed++;
        errors.push({
          line: index + 2,
          data: line,
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
        console.log(`Línea ${err.line}:`);
        console.log(`Datos: ${err.data}`);
        console.log(`Error: ${err.error}\n`);
      });
    }

    // Verificar la carga
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Total registros en la base de datos: ${count.count}`);

    // Mostrar algunos ejemplos
    const { rows: ejemplos } = await client.query('SELECT * FROM inventory ORDER BY id LIMIT 3');
    console.log('\n📋 Ejemplos de registros cargados:');
    ejemplos.forEach(item => {
      console.log(`ID: ${item.id}, Código: ${item.codigoEFC}, Marca: ${item.marca}, Modelo: ${item.modelo}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

loadInventory();

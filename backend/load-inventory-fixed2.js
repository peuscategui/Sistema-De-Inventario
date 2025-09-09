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

async function loadInventory() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    // Saltar la primera línea (encabezados)
    const dataLines = lines.slice(1);
    let count = 0;

    console.log('\n📥 Cargando inventario...');
    
    for (const line of dataLines) {
      try {
        const values = line.split(',').map(val => val.trim());
        
        // Convertir "No aplica" a null
        const cleanValues = values.map(val => 
          val === 'No aplica' || val === '-' || val === '' ? null : val
        );

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

        // Convertir fecha de Excel a formato ISO
        const fechaCompra = cleanValues[23] ? excelDateToJSDate(parseInt(cleanValues[23])) : null;

        const params = [
          cleanValues[0],                    // codigoEFC
          cleanValues[1],                    // marca
          cleanValues[2],                    // modelo
          cleanValues[3],                    // descripcion
          cleanValues[4],                    // serie
          cleanValues[5],                    // procesador
          cleanValues[6] ? parseInt(cleanValues[6]) : null, // anio
          cleanValues[7],                    // ram
          cleanValues[8],                    // discoDuro
          cleanValues[9],                    // sistemaOperativo
          cleanValues[10] || 'libre',        // status
          cleanValues[11],                   // estado
          cleanValues[12],                   // ubicacionEquipo
          cleanValues[13] ? parseInt(cleanValues[13]) : null, // qUsuarios
          cleanValues[14],                   // condicion
          false,                             // repotenciadas (default false)
          cleanValues[16],                   // clasificacionObsolescencia
          cleanValues[17],                   // clasificacionRepotenciadas
          cleanValues[18],                   // motivoCompra
          cleanValues[19],                   // proveedor
          cleanValues[20],                   // factura
          cleanValues[21] ? parseInt(cleanValues[21]) : null, // anioCompra
          cleanValues[22],                   // observaciones
          fechaCompra,                       // fecha_compra
          cleanValues[24] ? cleanValues[24].replace('$', '').replace(',', '') : null, // precioUnitarioSinIgv
          cleanValues[25] ? parseInt(cleanValues[25]) : null, // clasificacionId
          cleanValues[26] ? parseInt(cleanValues[26]) : null  // empleadoId
        ];

        await client.query(query, params);
        count++;
        console.log(`✅ Cargado item ${count}: ${cleanValues[0]}`);

      } catch (error) {
        console.error(`❌ Error en línea ${count + 2}:`, error.message);
        console.error('Datos:', line);
      }
    }

    console.log(`\n✅ Carga completada: ${count} items insertados`);

    // Verificar la carga
    const { rows } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Total items en la base de datos: ${rows[0].count}`);

    // Mostrar algunos ejemplos
    const { rows: ejemplos } = await client.query('SELECT * FROM inventory ORDER BY id LIMIT 3');
    console.log('\n📋 Ejemplos de items cargados:');
    ejemplos.forEach(item => {
      console.log(`ID: ${item.id}, Código: ${item.codigoEFC}, Marca: ${item.marca}, Modelo: ${item.modelo}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

loadInventory();

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

async function loadInventory() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`\n📂 Leyendo archivo: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    // Saltar la primera línea (encabezados)
    const dataLines = lines.slice(1);
    let count = 0;

    console.log('\n📥 Cargando inventario...');
    
    for (const line of dataLines) {
      if (line.trim()) {
        const values = line.split(',').map(val => val.trim());
        if (values.length >= headers.length) {
          try {
            const query = `
              INSERT INTO inventory (
                "codigoEFC", marca, modelo, descripcion, serie, procesador, 
                anio, ram, "discoDuro", "sistemaOperativo", status, estado,
                "ubicacionEquipo", "qUsuarios", condicion, repotenciadas,
                "clasificacionObsolescencia", "clasificacionRepotenciadas",
                "motivoCompra", proveedor, factura, "anioCompra", observaciones,
                fecha_compra, "precioUnitarioSinIgv", fecha_baja, motivo_baja,
                "clasificacionId", "empleadoId"
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                $27, $28, $29
              )
            `;

            const params = [
              values[0] || null,                    // codigoEFC
              values[1] || null,                    // marca
              values[2] || null,                    // modelo
              values[3] || null,                    // descripcion
              values[4] || null,                    // serie
              values[5] || null,                    // procesador
              values[6] ? parseInt(values[6]) : null, // anio
              values[7] || null,                    // ram
              values[8] || null,                    // discoDuro
              values[9] || null,                    // sistemaOperativo
              values[10] || 'libre',                // status
              values[11] || null,                   // estado
              values[12] || null,                   // ubicacionEquipo
              values[13] ? parseInt(values[13]) : null, // qUsuarios
              values[14] || null,                   // condicion
              values[15] === 'true',                // repotenciadas
              values[16] || null,                   // clasificacionObsolescencia
              values[17] || null,                   // clasificacionRepotenciadas
              values[18] || null,                   // motivoCompra
              values[19] || null,                   // proveedor
              values[20] || null,                   // factura
              values[21] ? parseInt(values[21]) : null, // anioCompra
              values[22] || null,                   // observaciones
              values[23] || null,                   // fecha_compra
              values[24] ? values[24].replace('$', '').replace(',', '') : null, // precioUnitarioSinIgv
              values[25] || null,                   // fecha_baja
              values[26] || null,                   // motivo_baja
              values[27] ? parseInt(values[27]) : null, // clasificacionId
              values[28] ? parseInt(values[28]) : null  // empleadoId
            ];

            await client.query(query, params);
            count++;

            if (count % 10 === 0) {
              console.log(`✅ Cargados ${count} items...`);
            }
          } catch (error) {
            console.error(`❌ Error en línea ${count + 1}:`, error.message);
            console.error('Datos:', values);
          }
        }
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
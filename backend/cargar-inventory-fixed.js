const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function cargarInventoryFixed() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        console.log('🔌 Conectando a la base de datos de producción...');
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        // Limpiar la tabla primero
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`🗑️ Eliminados ${deleteResult.rowCount} registros existentes`);

        // Resetear la secuencia
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('🔄 Secuencia del ID reseteada');

        // Leer el archivo original
        console.log('📂 Cargando datos del archivo original...');
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Procesar cada línea (saltando header)
        let registrosCargados = 0;
        let errores = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                // Dividir por comas y limpiar espacios
                const columns = line.split(',').map(col => col.trim());
                
                // Asegurar que tenemos exactamente 27 columnas
                if (columns.length !== 27) {
                    console.log(`⚠️ Línea ${i + 1} tiene ${columns.length} columnas, esperadas 27. Ajustando...`);
                    // Si hay más columnas, tomar solo las primeras 27
                    if (columns.length > 27) {
                        columns.splice(27);
                    }
                    // Si hay menos, rellenar con vacíos
                    while (columns.length < 27) {
                        columns.push('');
                    }
                }
                
                // Limpiar y procesar los datos
                const codigoEFC = columns[0] || null;
                const marca = columns[1] || null;
                const modelo = columns[2] || null;
                const descripcion = columns[3] || null;
                const serie = columns[4] || null;
                const procesador = columns[5] || null;
                const anio = columns[6] ? parseInt(columns[6]) : null;
                const ram = columns[7] || null;
                const discoDuro = columns[8] || null;
                const sistemaOperativo = columns[9] || null;
                const status = columns[10] || null;
                const estado = columns[11] || null;
                const ubicacionEquipo = columns[12] || null;
                const qUsuarios = columns[13] ? parseInt(columns[13]) : 1;
                const condicion = columns[14] || null;
                const repotenciadas = columns[15] ? (columns[15].toLowerCase() === 'true' || columns[15] === '1') : null;
                const clasificacionObsolescencia = columns[16] || null;
                const clasificacionRepotenciadas = columns[17] || null;
                const motivoCompra = columns[18] || null;
                const proveedor = columns[19] || null;
                const factura = columns[20] || null;
                const anioCompra = columns[21] ? parseInt(columns[21]) : null;
                const observaciones = columns[22] || null;
                const fecha_compra = columns[23] ? new Date(columns[23]) : null;
                const precioUnitarioSinIgv = columns[24] ? parseFloat(columns[24].replace(/[$,]/g, '')) : 0;
                const clasificacionId = columns[25] ? parseInt(columns[25]) : null;
                const empleadoId = columns[26] ? parseInt(columns[26]) : null;
                
                const insertQuery = `
                    INSERT INTO inventory (
                        "codigoEFC", marca, modelo, descripcion, serie, procesador, anio, 
                        ram, "discoDuro", "sistemaOperativo", status, estado, "ubicacionEquipo", 
                        "qUsuarios", condicion, repotenciadas, "clasificacionObsolescencia", 
                        "clasificacionRepotenciadas", "motivoCompra", proveedor, factura, 
                        "anioCompra", observaciones, fecha_compra, "precioUnitarioSinIgv", 
                        fecha_baja, motivo_baja, "clasificacionId", "empleadoId"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
                    )
                `;
                
                const values = [
                    codigoEFC, marca, modelo, descripcion, serie, procesador, anio,
                    ram, discoDuro, sistemaOperativo, status, estado, ubicacionEquipo,
                    qUsuarios, condicion, repotenciadas, clasificacionObsolescencia,
                    clasificacionRepotenciadas, motivoCompra, proveedor, factura,
                    anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv,
                    null, null, clasificacionId, empleadoId
                ];
                
                await client.query(insertQuery, values);
                registrosCargados++;
                
                if (registrosCargados % 50 === 0) {
                    console.log(`📝 Cargados ${registrosCargados} registros...`);
                }
                
            } catch (error) {
                console.log(`❌ Error en línea ${i + 1}: ${error.message}`);
                console.log(`   Datos: ${line.substring(0, 100)}...`);
                errores++;
            }
        }
        
        console.log(`\n✅ Carga completada:`);
        console.log(`   - Registros cargados: ${registrosCargados}`);
        console.log(`   - Errores: ${errores}`);
        
        // Verificar el total
        const countResult = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${countResult.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFixed();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function cargarInventory28Columnas() {
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

        // Leer el archivo limpio
        console.log('📂 Cargando datos del archivo limpio...');
        const csvPath = path.join(__dirname, '05_inventory_limpio.csv');
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
                // Dividir por comas
                const columns = line.split(',').map(col => col.trim());
                
                // Verificar que tenemos exactamente 28 columnas del CSV
                if (columns.length !== 28) {
                    console.log(`⚠️ Línea ${i + 1} tiene ${columns.length} columnas, esperadas 28. Saltando...`);
                    console.log(`   Datos: ${line.substring(0, 100)}...`);
                    errores++;
                    continue;
                }
                
                // Mapear las 28 columnas del CSV a las 30 columnas de la BD
                // Las columnas fecha_baja y motivo_baja se omiten (se ponen como null)
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
                    columns[0] || null,  // codigoEFC
                    columns[1] || null,  // marca
                    columns[2] || null,  // modelo
                    columns[3] || null,  // descripcion
                    columns[4] || null,  // serie
                    columns[5] || null,  // procesador
                    columns[6] ? parseInt(columns[6]) : null,  // anio
                    columns[7] || null,  // ram
                    columns[8] || null,  // discoDuro
                    columns[9] || null,  // sistemaOperativo
                    columns[10] || null, // status
                    columns[11] || null, // estado
                    columns[12] || null, // ubicacionEquipo
                    columns[13] ? parseInt(columns[13]) : 1,  // qUsuarios
                    columns[14] || null, // condicion
                    columns[15] ? (columns[15].toLowerCase() === 'true' || columns[15] === '1') : null, // repotenciadas
                    columns[16] || null, // clasificacionObsolescencia
                    columns[17] || null, // clasificacionRepotenciadas
                    columns[18] || null, // motivoCompra
                    columns[19] || null, // proveedor
                    columns[20] || null, // factura
                    columns[21] ? parseInt(columns[21]) : null,  // anioCompra
                    columns[22] || null, // observaciones
                    columns[23] ? new Date(columns[23]) : null,  // fecha_compra
                    columns[24] ? parseFloat(columns[24].replace(/[$,]/g, '')) : 0,  // precioUnitarioSinIgv
                    null,  // fecha_baja (no está en el CSV - se omite)
                    null,  // motivo_baja (no está en el CSV - se omite)
                    columns[25] ? parseInt(columns[25]) : null, // clasificacionId
                    columns[26] ? parseInt(columns[26]) : null  // empleadoId
                ];
                
                await client.query(insertQuery, values);
                registrosCargados++;
                
                if (registrosCargados % 10 === 0) {
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

cargarInventory28Columnas();

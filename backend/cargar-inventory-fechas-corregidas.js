const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryFechasCorregidas() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔌 Conectando a la base de datos...');

        // Limpiar la tabla inventory primero
        console.log('🧹 Limpiando tabla inventory...');
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Tabla inventory limpiada');

        // Leer el archivo CSV limpio
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        
        console.log(`📊 Archivo CSV leído: ${csvFilePath}`);

        // Parsear el CSV
        const records = await new Promise((resolve, reject) => {
            parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }, (err, output) => {
                if (err) return reject(err);
                resolve(output);
            });
        });

        console.log(`📊 Registros parseados del CSV: ${records.length}`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        console.log('\n🚀 Iniciando carga de datos con fechas corregidas...');

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2; // +1 for header, +1 for 0-based index

            try {
                // CORREGIDO: Intercambiar columnas 25 y 26
                // Columna 25 en CSV es precio, columna 26 es fecha_compra
                let precioLimpio = null;
                if (record.fecha_compra) { // Esta es realmente el precio
                    const precioStr = record.fecha_compra.toString().trim();
                    if (precioStr && precioStr !== '' && precioStr !== 'NULL') {
                        const precioNumerico = precioStr.replace(/[$,]/g, '').trim();
                        if (precioNumerico && !isNaN(parseFloat(precioNumerico))) {
                            precioLimpio = parseFloat(precioNumerico);
                        }
                    }
                }

                // CORREGIDO: La fecha está en precioUnitarioSinIgv
                let fechaCompra = null;
                if (record.precioUnitarioSinIgv && record.precioUnitarioSinIgv !== 'NULL') {
                    const fechaStr = record.precioUnitarioSinIgv.toString().trim();
                    if (fechaStr && fechaStr !== '' && fechaStr !== 'NULL') {
                        // Convertir fecha de Excel a fecha normal
                        const fechaNum = parseFloat(fechaStr);
                        if (!isNaN(fechaNum) && fechaNum > 0) {
                            // Convertir número de Excel a fecha
                            const fecha = new Date((fechaNum - 25569) * 86400 * 1000);
                            if (!isNaN(fecha.getTime())) {
                                fechaCompra = fecha.toISOString().split('T')[0];
                            }
                        }
                    }
                }

                // Manejar clasificacionId
                let clasificacionId = null;
                const clasificacionStr = record.clasificacionId?.trim();
                if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== 'NULL' && !isNaN(parseInt(clasificacionStr))) {
                    const id = parseInt(clasificacionStr);
                    if (id >= 1 && id <= 38) {
                        clasificacionId = id;
                    }
                }

                // Manejar empleadoId
                let empleadoId = null;
                const empleadoStr = record.empleadoId?.trim();
                if (empleadoStr && empleadoStr !== 'NULL' && !isNaN(parseInt(empleadoStr))) {
                    empleadoId = parseInt(empleadoStr);
                }

                // Manejar valores NULL del CSV
                const cleanValue = (value) => {
                    if (!value || value === 'NULL' || value === 'null' || value.trim() === '') {
                        return null;
                    }
                    return value.trim();
                };

                // Insertar registro con fechas corregidas
                const insertQuery = `
                    INSERT INTO inventory (
                        "codigoEFC", marca, modelo, descripcion, serie, procesador, anio, ram, 
                        "discoDuro", "sistemaOperativo", status, estado, "ubicacionEquipo", 
                        "qUsuarios", condicion, repotenciadas, "clasificacionObsolescencia", 
                        "clasificacionRepotenciadas", "motivoCompra", proveedor, factura, 
                        "anioCompra", observaciones, "fecha_compra", "precioUnitarioSinIgv", 
                        "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
                    )
                `;

                const values = [
                    cleanValue(record.codigoEFC),
                    cleanValue(record.marca),
                    cleanValue(record.modelo),
                    cleanValue(record.descripcion),
                    cleanValue(record.serie),
                    cleanValue(record.procesador),
                    record.anio && record.anio !== 'NULL' ? parseInt(record.anio) : null,
                    cleanValue(record.ram),
                    cleanValue(record.discoDuro),
                    cleanValue(record.sistemaOperativo),
                    cleanValue(record.status),
                    cleanValue(record.estado),
                    cleanValue(record.ubicacionEquipo),
                    record.qUsuarios && record.qUsuarios !== 'NULL' ? parseInt(record.qUsuarios) || 1 : 1,
                    cleanValue(record.condicion),
                    record.repotenciadas === 'true' || record.repotenciadas === 'si' || record.repotenciadas === '1' || record.repotenciadas === 'True',
                    cleanValue(record.clasificacionObsolescencia),
                    cleanValue(record.clasificacionRepotenciadas),
                    cleanValue(record.motivoCompra),
                    cleanValue(record.proveedor),
                    cleanValue(record.factura),
                    record.anioCompra && record.anioCompra !== 'NULL' ? parseInt(record.anioCompra) : null,
                    cleanValue(record.observaciones),
                    fechaCompra, // CORREGIDO: Usar la fecha corregida
                    precioLimpio, // CORREGIDO: Usar el precio corregido
                    null, // fecha_baja (siempre null)
                    null, // motivo_baja (siempre null)
                    clasificacionId,
                    empleadoId
                ];

                await client.query(insertQuery, values);
                successCount++;

                if (successCount % 50 === 0) {
                    console.log(`✅ Procesados: ${successCount}/${records.length}`);
                }

            } catch (error) {
                errorCount++;
                errors.push({
                    line: lineNum,
                    codigoEFC: record.codigoEFC,
                    error: error.message
                });
                console.log(`❌ Error en línea ${lineNum} (${record.codigoEFC}): ${error.message}`);
            }
        }

        console.log('\n📊 RESUMEN DE LA CARGA:');
        console.log('================================================================================');
        console.log(`✅ Registros cargados exitosamente: ${successCount}`);
        console.log(`❌ Registros con error: ${errorCount}`);
        console.log(`📊 Total procesados: ${successCount + errorCount}`);
        console.log(`📊 Total en CSV: ${records.length}`);

        // Verificar fechas de compra después de la carga
        console.log('\n🔍 Verificando fechas de compra después de la carga...');
        const fechaResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT("fecha_compra") as con_fecha,
                COUNT(*) - COUNT("fecha_compra") as sin_fecha
            FROM inventory
        `);

        const fechaStats = fechaResult.rows[0];
        console.log(`📊 Total registros: ${fechaStats.total}`);
        console.log(`📊 Con fecha_compra: ${fechaStats.con_fecha}`);
        console.log(`📊 Sin fecha_compra: ${fechaStats.sin_fecha}`);

        // Mostrar algunos registros con fechas
        const sampleResult = await client.query(`
            SELECT 
                id, "codigoEFC", "fecha_compra", "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "fecha_compra" IS NOT NULL
            ORDER BY id 
            LIMIT 5
        `);
        
        if (sampleResult.rows.length > 0) {
            console.log('\n📋 MUESTRA DE REGISTROS CON FECHAS:');
            sampleResult.rows.forEach((item, index) => {
                console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - Fecha: ${item.fecha_compra} - Precio: ${item.precioUnitarioSinIgv}`);
            });
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFechasCorregidas();

const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryNuevoLimpio() {
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
        console.log(`📊 Tamaño del archivo: ${fileContent.length} caracteres`);

        // Pre-procesar el CSV para manejar precios con comas
        const processedContent = fileContent
            .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
            .replace(/,(\s*)/g, ',');

        // Parsear el CSV
        const records = await new Promise((resolve, reject) => {
            parse(processedContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }, (err, output) => {
                if (err) return reject(err);
                resolve(output);
            });
        });

        console.log(`📊 Registros parseados del CSV: ${records.length}`);

        // Verificar la estructura de los primeros registros
        if (records.length > 0) {
            console.log('\n🔍 Verificando estructura del primer registro:');
            const firstRecord = records[0];
            console.log(`   Columnas disponibles: ${Object.keys(firstRecord).length}`);
            console.log(`   Columnas: ${Object.keys(firstRecord).join(', ')}`);
            console.log(`   Código EFC: ${firstRecord.codigoEFC}`);
            console.log(`   Marca: ${firstRecord.marca}`);
            console.log(`   Clasificación ID: ${firstRecord.clasificacionId}`);
            console.log(`   Empleado ID: ${firstRecord.empleadoId}`);
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        console.log('\n🚀 Iniciando carga de datos...');

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2; // +1 for header, +1 for 0-based index

            try {
                // Limpiar precio
                let precioLimpio = null;
                if (record.precioUnitarioSinIgv) {
                    const precioStr = record.precioUnitarioSinIgv.toString().trim();
                    if (precioStr && precioStr !== '') {
                        // Remover símbolos de moneda y espacios
                        const precioNumerico = precioStr.replace(/[$,]/g, '').trim();
                        if (precioNumerico && !isNaN(parseFloat(precioNumerico))) {
                            precioLimpio = parseFloat(precioNumerico);
                        }
                    }
                }

                // Manejar clasificacionId
                let clasificacionId = null;
                const clasificacionStr = record.clasificacionId?.trim();
                if (clasificacionStr && clasificacionStr !== '00' && !isNaN(parseInt(clasificacionStr))) {
                    const id = parseInt(clasificacionStr);
                    if (id >= 1 && id <= 38) {
                        clasificacionId = id;
                    }
                }

                // Manejar empleadoId
                let empleadoId = null;
                const empleadoStr = record.empleadoId?.trim();
                if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                    empleadoId = parseInt(empleadoStr);
                }

                // Insertar registro
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
                        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
                    )
                `;

                const values = [
                    record.codigoEFC?.trim() || null,
                    record.marca?.trim() || null,
                    record.modelo?.trim() || null,
                    record.descripcion?.trim() || null,
                    record.serie?.trim() || null,
                    record.procesador?.trim() || null,
                    record.anio ? parseInt(record.anio) : null,
                    record.ram?.trim() || null,
                    record.discoDuro?.trim() || null,
                    record.sistemaOperativo?.trim() || null,
                    record.status?.trim() || null,
                    record.estado?.trim() || null,
                    record.ubicacionEquipo?.trim() || null,
                    record.qUsuarios ? parseInt(record.qUsuarios) || 1 : 1,
                    record.condicion?.trim() || null,
                    record.repotenciadas === 'true' || record.repotenciadas === 'si' || record.repotenciadas === '1',
                    record.clasificacionObsolescencia?.trim() || null,
                    record.clasificacionRepotenciadas?.trim() || null,
                    record.motivoCompra?.trim() || null,
                    record.proveedor?.trim() || null,
                    record.factura?.trim() || null,
                    record.anioCompra ? parseInt(record.anioCompra) : null,
                    record.observaciones?.trim() || null,
                    null, // fecha_compra
                    precioLimpio,
                    null, // fecha_baja
                    null, // motivo_baja
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

        if (errors.length > 0) {
            console.log('\n❌ ERRORES DETALLADOS:');
            console.log('================================================================================');
            errors.slice(0, 10).forEach((error, index) => {
                console.log(`${index + 1}. Línea ${error.line} (${error.codigoEFC}): ${error.error}`);
            });
            if (errors.length > 10) {
                console.log(`... y ${errors.length - 10} errores más`);
            }
        }

        // Verificar el total final en la base de datos
        const finalCount = await client.query('SELECT COUNT(*) as total FROM inventory');
        console.log(`\n📊 Total final en la base de datos: ${finalCount.rows[0].total}`);

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryNuevoLimpio();

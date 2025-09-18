const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryFinal() {
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

        // Verificar la estructura de los primeros registros
        if (records.length > 0) {
            console.log('\n🔍 Verificando estructura del primer registro:');
            const firstRecord = records[0];
            console.log(`   Columnas disponibles: ${Object.keys(firstRecord).length}`);
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
                    if (precioStr && precioStr !== '' && precioStr !== 'NULL') {
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

                // Insertar registro (29 columnas, sin id)
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
                    null, // fecha_compra (siempre null)
                    precioLimpio,
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

        // Verificar algunos registros de muestra
        console.log('\n🔍 MUESTRA DE REGISTROS CARGADOS:');
        const sampleResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "clasificacionId", "empleadoId"
            FROM inventory 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Marca: ${item.marca} - Clasificación: ${item.clasificacionId} - Empleado: ${item.empleadoId}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFinal();


const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryFinal() {
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

        // Verificar la estructura de los primeros registros
        if (records.length > 0) {
            console.log('\n🔍 Verificando estructura del primer registro:');
            const firstRecord = records[0];
            console.log(`   Columnas disponibles: ${Object.keys(firstRecord).length}`);
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
                    if (precioStr && precioStr !== '' && precioStr !== 'NULL') {
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

                // Insertar registro (29 columnas, sin id)
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
                    null, // fecha_compra (siempre null)
                    precioLimpio,
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

        // Verificar algunos registros de muestra
        console.log('\n🔍 MUESTRA DE REGISTROS CARGADOS:');
        const sampleResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "clasificacionId", "empleadoId"
            FROM inventory 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Marca: ${item.marca} - Clasificación: ${item.clasificacionId} - Empleado: ${item.empleadoId}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFinal();






const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryFinal() {
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

        // Verificar la estructura de los primeros registros
        if (records.length > 0) {
            console.log('\n🔍 Verificando estructura del primer registro:');
            const firstRecord = records[0];
            console.log(`   Columnas disponibles: ${Object.keys(firstRecord).length}`);
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
                    if (precioStr && precioStr !== '' && precioStr !== 'NULL') {
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

                // Insertar registro (29 columnas, sin id)
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
                    null, // fecha_compra (siempre null)
                    precioLimpio,
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

        // Verificar algunos registros de muestra
        console.log('\n🔍 MUESTRA DE REGISTROS CARGADOS:');
        const sampleResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "clasificacionId", "empleadoId"
            FROM inventory 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Marca: ${item.marca} - Clasificación: ${item.clasificacionId} - Empleado: ${item.empleadoId}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFinal();


const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryFinal() {
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

        // Verificar la estructura de los primeros registros
        if (records.length > 0) {
            console.log('\n🔍 Verificando estructura del primer registro:');
            const firstRecord = records[0];
            console.log(`   Columnas disponibles: ${Object.keys(firstRecord).length}`);
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
                    if (precioStr && precioStr !== '' && precioStr !== 'NULL') {
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

                // Insertar registro (29 columnas, sin id)
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
                    null, // fecha_compra (siempre null)
                    precioLimpio,
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

        // Verificar algunos registros de muestra
        console.log('\n🔍 MUESTRA DE REGISTROS CARGADOS:');
        const sampleResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "clasificacionId", "empleadoId"
            FROM inventory 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Marca: ${item.marca} - Clasificación: ${item.clasificacionId} - Empleado: ${item.empleadoId}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryFinal();






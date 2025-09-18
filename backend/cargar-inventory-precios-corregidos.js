const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryPreciosCorregidos() {
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

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Tabla limpiada y secuencia reseteada');

        // Leer el archivo CSV
        console.log('📂 Leyendo archivo CSV...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Pre-procesar el CSV para manejar precios con comas
        console.log('🔧 Pre-procesando CSV para manejar precios con comas...');
        const processedContent = fileContent
            // Limpiar precios con comas decimales: 353,00 -> 353.00
            .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
            // Limpiar espacios alrededor de comas
            .replace(/,(\s*)/g, ',');

        // Usar csv-parse para manejar comas dentro de campos
        const records = [];
        await new Promise((resolve, reject) => {
            parse(processedContent, {
                columns: true, // Usar primera línea como headers
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true, // Permitir diferentes números de columnas
                quote: '"',
                escape: '"',
                delimiter: ','
            }, (err, data) => {
                if (err) reject(err);
                else {
                    records.push(...data);
                    resolve();
                }
            });
        });

        console.log(`📊 Total de registros parseados: ${records.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2;

            const codigoEFC = record.codigoEFC?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = record.precioUnitarioSinIgv?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = record.anio?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra
            let fecha_compra = null;
            const fechaStr = record.fecha_compra?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO
            let clasificacionId = null;
            const clasificacionStr = record.clasificacionId?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO
            let empleadoId = null;
            const empleadoStr = record.empleadoId?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Debug para el primer registro
            if (i === 0) {
                console.log('\n🔍 DEBUG PRIMER REGISTRO:');
                console.log(`   codigoEFC: "${codigoEFC}"`);
                console.log(`   precioUnitarioSinIgv: "${record.precioUnitarioSinIgv}"`);
                console.log(`   precioLimpio: ${precioLimpio}`);
                console.log(`   clasificacionId: "${clasificacionStr}" -> ${clasificacionId}`);
                console.log(`   empleadoId: "${empleadoStr}" -> ${empleadoId}`);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                record.marca?.trim() || null, // marca
                record.modelo?.trim() || null, // modelo
                record.descripcion?.trim() || null, // descripcion
                record.serie?.trim() || null, // serie
                record.procesador?.trim() || null, // procesador
                anio, // anio
                record.ram?.trim() || null, // ram
                record.discoDuro?.trim() || null, // discoDuro
                record.sistemaOPERATIVO?.trim() || null, // sistemaOperativo
                record.status?.trim() || null, // status
                record.estado?.trim() || null, // estado
                record.ubicacionEquipo?.trim() || null, // ubicacionEquipo
                record.qUsuarios ? parseInt(record.qUsuarios) || 1 : 1, // qUsuarios
                record.condicion?.trim() || null, // condicion
                record.repotenciadas?.toLowerCase() === 'true' || record.repotenciadas?.toLowerCase() === 'si' || record.repotenciadas === '1', // repotenciadas
                record.clasificacionObsolescencia?.trim() || null, // clasificacionObsolescencia
                record.clasificacionRepotenciadas?.trim() || null, // clasificacionRepotenciadas
                record.motivoCompra?.trim() || null, // motivoCompra
                record.proveedor?.trim() || null, // proveedor
                record.factura?.trim() || null, // factura
                record.anioCompra ? parseInt(record.anioCompra) : null, // anioCompra
                record.observaciones?.trim() || null, // observaciones
                fecha_compra, // fecha_compra
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId
                empleadoId // empleadoId
            ];

            const dbColumns = [
                "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
                "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
                "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
                "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
                "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
                "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
            ];

            const insertQuery = `
                INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
                VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
            `;

            try {
                await client.query(insertQuery, values);
                loadedCount++;
                if (loadedCount % 50 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros cargados: ${loadedCount}`);
        console.log(`   - Errores: ${errorCount}`);

        const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error general en la carga:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryPreciosCorregidos();



const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryPreciosCorregidos() {
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

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Tabla limpiada y secuencia reseteada');

        // Leer el archivo CSV
        console.log('📂 Leyendo archivo CSV...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Pre-procesar el CSV para manejar precios con comas
        console.log('🔧 Pre-procesando CSV para manejar precios con comas...');
        const processedContent = fileContent
            // Limpiar precios con comas decimales: 353,00 -> 353.00
            .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
            // Limpiar espacios alrededor de comas
            .replace(/,(\s*)/g, ',');

        // Usar csv-parse para manejar comas dentro de campos
        const records = [];
        await new Promise((resolve, reject) => {
            parse(processedContent, {
                columns: true, // Usar primera línea como headers
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true, // Permitir diferentes números de columnas
                quote: '"',
                escape: '"',
                delimiter: ','
            }, (err, data) => {
                if (err) reject(err);
                else {
                    records.push(...data);
                    resolve();
                }
            });
        });

        console.log(`📊 Total de registros parseados: ${records.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2;

            const codigoEFC = record.codigoEFC?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = record.precioUnitarioSinIgv?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = record.anio?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra
            let fecha_compra = null;
            const fechaStr = record.fecha_compra?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO
            let clasificacionId = null;
            const clasificacionStr = record.clasificacionId?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO
            let empleadoId = null;
            const empleadoStr = record.empleadoId?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Debug para el primer registro
            if (i === 0) {
                console.log('\n🔍 DEBUG PRIMER REGISTRO:');
                console.log(`   codigoEFC: "${codigoEFC}"`);
                console.log(`   precioUnitarioSinIgv: "${record.precioUnitarioSinIgv}"`);
                console.log(`   precioLimpio: ${precioLimpio}`);
                console.log(`   clasificacionId: "${clasificacionStr}" -> ${clasificacionId}`);
                console.log(`   empleadoId: "${empleadoStr}" -> ${empleadoId}`);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                record.marca?.trim() || null, // marca
                record.modelo?.trim() || null, // modelo
                record.descripcion?.trim() || null, // descripcion
                record.serie?.trim() || null, // serie
                record.procesador?.trim() || null, // procesador
                anio, // anio
                record.ram?.trim() || null, // ram
                record.discoDuro?.trim() || null, // discoDuro
                record.sistemaOPERATIVO?.trim() || null, // sistemaOperativo
                record.status?.trim() || null, // status
                record.estado?.trim() || null, // estado
                record.ubicacionEquipo?.trim() || null, // ubicacionEquipo
                record.qUsuarios ? parseInt(record.qUsuarios) || 1 : 1, // qUsuarios
                record.condicion?.trim() || null, // condicion
                record.repotenciadas?.toLowerCase() === 'true' || record.repotenciadas?.toLowerCase() === 'si' || record.repotenciadas === '1', // repotenciadas
                record.clasificacionObsolescencia?.trim() || null, // clasificacionObsolescencia
                record.clasificacionRepotenciadas?.trim() || null, // clasificacionRepotenciadas
                record.motivoCompra?.trim() || null, // motivoCompra
                record.proveedor?.trim() || null, // proveedor
                record.factura?.trim() || null, // factura
                record.anioCompra ? parseInt(record.anioCompra) : null, // anioCompra
                record.observaciones?.trim() || null, // observaciones
                fecha_compra, // fecha_compra
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId
                empleadoId // empleadoId
            ];

            const dbColumns = [
                "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
                "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
                "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
                "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
                "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
                "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
            ];

            const insertQuery = `
                INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
                VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
            `;

            try {
                await client.query(insertQuery, values);
                loadedCount++;
                if (loadedCount % 50 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros cargados: ${loadedCount}`);
        console.log(`   - Errores: ${errorCount}`);

        const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error general en la carga:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryPreciosCorregidos();







const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryPreciosCorregidos() {
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

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Tabla limpiada y secuencia reseteada');

        // Leer el archivo CSV
        console.log('📂 Leyendo archivo CSV...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Pre-procesar el CSV para manejar precios con comas
        console.log('🔧 Pre-procesando CSV para manejar precios con comas...');
        const processedContent = fileContent
            // Limpiar precios con comas decimales: 353,00 -> 353.00
            .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
            // Limpiar espacios alrededor de comas
            .replace(/,(\s*)/g, ',');

        // Usar csv-parse para manejar comas dentro de campos
        const records = [];
        await new Promise((resolve, reject) => {
            parse(processedContent, {
                columns: true, // Usar primera línea como headers
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true, // Permitir diferentes números de columnas
                quote: '"',
                escape: '"',
                delimiter: ','
            }, (err, data) => {
                if (err) reject(err);
                else {
                    records.push(...data);
                    resolve();
                }
            });
        });

        console.log(`📊 Total de registros parseados: ${records.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2;

            const codigoEFC = record.codigoEFC?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = record.precioUnitarioSinIgv?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = record.anio?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra
            let fecha_compra = null;
            const fechaStr = record.fecha_compra?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO
            let clasificacionId = null;
            const clasificacionStr = record.clasificacionId?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO
            let empleadoId = null;
            const empleadoStr = record.empleadoId?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Debug para el primer registro
            if (i === 0) {
                console.log('\n🔍 DEBUG PRIMER REGISTRO:');
                console.log(`   codigoEFC: "${codigoEFC}"`);
                console.log(`   precioUnitarioSinIgv: "${record.precioUnitarioSinIgv}"`);
                console.log(`   precioLimpio: ${precioLimpio}`);
                console.log(`   clasificacionId: "${clasificacionStr}" -> ${clasificacionId}`);
                console.log(`   empleadoId: "${empleadoStr}" -> ${empleadoId}`);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                record.marca?.trim() || null, // marca
                record.modelo?.trim() || null, // modelo
                record.descripcion?.trim() || null, // descripcion
                record.serie?.trim() || null, // serie
                record.procesador?.trim() || null, // procesador
                anio, // anio
                record.ram?.trim() || null, // ram
                record.discoDuro?.trim() || null, // discoDuro
                record.sistemaOPERATIVO?.trim() || null, // sistemaOperativo
                record.status?.trim() || null, // status
                record.estado?.trim() || null, // estado
                record.ubicacionEquipo?.trim() || null, // ubicacionEquipo
                record.qUsuarios ? parseInt(record.qUsuarios) || 1 : 1, // qUsuarios
                record.condicion?.trim() || null, // condicion
                record.repotenciadas?.toLowerCase() === 'true' || record.repotenciadas?.toLowerCase() === 'si' || record.repotenciadas === '1', // repotenciadas
                record.clasificacionObsolescencia?.trim() || null, // clasificacionObsolescencia
                record.clasificacionRepotenciadas?.trim() || null, // clasificacionRepotenciadas
                record.motivoCompra?.trim() || null, // motivoCompra
                record.proveedor?.trim() || null, // proveedor
                record.factura?.trim() || null, // factura
                record.anioCompra ? parseInt(record.anioCompra) : null, // anioCompra
                record.observaciones?.trim() || null, // observaciones
                fecha_compra, // fecha_compra
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId
                empleadoId // empleadoId
            ];

            const dbColumns = [
                "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
                "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
                "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
                "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
                "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
                "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
            ];

            const insertQuery = `
                INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
                VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
            `;

            try {
                await client.query(insertQuery, values);
                loadedCount++;
                if (loadedCount % 50 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros cargados: ${loadedCount}`);
        console.log(`   - Errores: ${errorCount}`);

        const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error general en la carga:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryPreciosCorregidos();



const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryPreciosCorregidos() {
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

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Tabla limpiada y secuencia reseteada');

        // Leer el archivo CSV
        console.log('📂 Leyendo archivo CSV...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Pre-procesar el CSV para manejar precios con comas
        console.log('🔧 Pre-procesando CSV para manejar precios con comas...');
        const processedContent = fileContent
            // Limpiar precios con comas decimales: 353,00 -> 353.00
            .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
            // Limpiar espacios alrededor de comas
            .replace(/,(\s*)/g, ',');

        // Usar csv-parse para manejar comas dentro de campos
        const records = [];
        await new Promise((resolve, reject) => {
            parse(processedContent, {
                columns: true, // Usar primera línea como headers
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true, // Permitir diferentes números de columnas
                quote: '"',
                escape: '"',
                delimiter: ','
            }, (err, data) => {
                if (err) reject(err);
                else {
                    records.push(...data);
                    resolve();
                }
            });
        });

        console.log(`📊 Total de registros parseados: ${records.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const lineNum = i + 2;

            const codigoEFC = record.codigoEFC?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = record.precioUnitarioSinIgv?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = record.anio?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra
            let fecha_compra = null;
            const fechaStr = record.fecha_compra?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO
            let clasificacionId = null;
            const clasificacionStr = record.clasificacionId?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO
            let empleadoId = null;
            const empleadoStr = record.empleadoId?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Debug para el primer registro
            if (i === 0) {
                console.log('\n🔍 DEBUG PRIMER REGISTRO:');
                console.log(`   codigoEFC: "${codigoEFC}"`);
                console.log(`   precioUnitarioSinIgv: "${record.precioUnitarioSinIgv}"`);
                console.log(`   precioLimpio: ${precioLimpio}`);
                console.log(`   clasificacionId: "${clasificacionStr}" -> ${clasificacionId}`);
                console.log(`   empleadoId: "${empleadoStr}" -> ${empleadoId}`);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                record.marca?.trim() || null, // marca
                record.modelo?.trim() || null, // modelo
                record.descripcion?.trim() || null, // descripcion
                record.serie?.trim() || null, // serie
                record.procesador?.trim() || null, // procesador
                anio, // anio
                record.ram?.trim() || null, // ram
                record.discoDuro?.trim() || null, // discoDuro
                record.sistemaOPERATIVO?.trim() || null, // sistemaOperativo
                record.status?.trim() || null, // status
                record.estado?.trim() || null, // estado
                record.ubicacionEquipo?.trim() || null, // ubicacionEquipo
                record.qUsuarios ? parseInt(record.qUsuarios) || 1 : 1, // qUsuarios
                record.condicion?.trim() || null, // condicion
                record.repotenciadas?.toLowerCase() === 'true' || record.repotenciadas?.toLowerCase() === 'si' || record.repotenciadas === '1', // repotenciadas
                record.clasificacionObsolescencia?.trim() || null, // clasificacionObsolescencia
                record.clasificacionRepotenciadas?.trim() || null, // clasificacionRepotenciadas
                record.motivoCompra?.trim() || null, // motivoCompra
                record.proveedor?.trim() || null, // proveedor
                record.factura?.trim() || null, // factura
                record.anioCompra ? parseInt(record.anioCompra) : null, // anioCompra
                record.observaciones?.trim() || null, // observaciones
                fecha_compra, // fecha_compra
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId
                empleadoId // empleadoId
            ];

            const dbColumns = [
                "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
                "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
                "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
                "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
                "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
                "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
            ];

            const insertQuery = `
                INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
                VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
            `;

            try {
                await client.query(insertQuery, values);
                loadedCount++;
                if (loadedCount % 50 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros cargados: ${loadedCount}`);
        console.log(`   - Errores: ${errorCount}`);

        const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error general en la carga:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryPreciosCorregidos();







const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function cargarInventorySimple() {
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

        // Leer el archivo CSV línea por línea
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Saltar el header (primera línea)
        const dataLines = lines.slice(1);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Verificar cuántos registros ya existen
        const existingCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros existentes en la base de datos: ${existingCount.rows[0].count}`);

        let loadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2; // +2 para contar el header y empezar desde la línea 2

            // Dividir la línea por comas
            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                skippedCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                skippedCount++;
                continue;
            }

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                console.log(`⏭️ Saltando registro existente: ${codigoEFC}`);
                skippedCount++;
                continue;
            }

            // Limpiar precios (quitar $ y cambiar , por .)
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Mapear las columnas (CSV tiene 28 columnas, DB espera 29)
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                columns[6] ? parseInt(columns[6]) : null, // anio
                columns[7]?.trim() || null, // ram
                columns[8]?.trim() || null, // discoDuro
                columns[9]?.trim() || null, // sistemaOperativo
                columns[10]?.trim() || null, // status
                columns[11]?.trim() || null, // estado
                columns[12]?.trim() || null, // ubicacionEquipo
                columns[13] ? parseInt(columns[13]) || 1 : 1, // qUsuarios
                columns[14]?.trim() || null, // condicion
                columns[15]?.toLowerCase() === 'true' || columns[15]?.toLowerCase() === 'si' || columns[15] === '1', // repotenciadas
                columns[16]?.trim() || null, // clasificacionObsolescencia
                columns[17]?.trim() || null, // clasificacionRepotenciadas
                columns[18]?.trim() || null, // motivoCompra
                columns[19]?.trim() || null, // proveedor
                columns[20]?.trim() || null, // factura
                columns[21] ? parseInt(columns[21]) : null, // anioCompra
                columns[22]?.trim() || null, // observaciones
                null, // fecha_compra (se establece como null para evitar problemas)
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                columns[26] ? parseInt(columns[26]) : null, // clasificacionId (columna 26)
                columns[27] ? parseInt(columns[27]) : null // empleadoId (columna 27)
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
                if (loadedCount % 10 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros nuevos...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros nuevos cargados: ${loadedCount}`);
        console.log(`   - Registros existentes saltados: ${skippedCount}`);
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

cargarInventorySimple();


const path = require('path');

async function cargarInventorySimple() {
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

        // Leer el archivo CSV línea por línea
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Saltar el header (primera línea)
        const dataLines = lines.slice(1);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Verificar cuántos registros ya existen
        const existingCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros existentes en la base de datos: ${existingCount.rows[0].count}`);

        let loadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2; // +2 para contar el header y empezar desde la línea 2

            // Dividir la línea por comas
            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                skippedCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                skippedCount++;
                continue;
            }

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                console.log(`⏭️ Saltando registro existente: ${codigoEFC}`);
                skippedCount++;
                continue;
            }

            // Limpiar precios (quitar $ y cambiar , por .)
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Mapear las columnas (CSV tiene 28 columnas, DB espera 29)
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                columns[6] ? parseInt(columns[6]) : null, // anio
                columns[7]?.trim() || null, // ram
                columns[8]?.trim() || null, // discoDuro
                columns[9]?.trim() || null, // sistemaOperativo
                columns[10]?.trim() || null, // status
                columns[11]?.trim() || null, // estado
                columns[12]?.trim() || null, // ubicacionEquipo
                columns[13] ? parseInt(columns[13]) || 1 : 1, // qUsuarios
                columns[14]?.trim() || null, // condicion
                columns[15]?.toLowerCase() === 'true' || columns[15]?.toLowerCase() === 'si' || columns[15] === '1', // repotenciadas
                columns[16]?.trim() || null, // clasificacionObsolescencia
                columns[17]?.trim() || null, // clasificacionRepotenciadas
                columns[18]?.trim() || null, // motivoCompra
                columns[19]?.trim() || null, // proveedor
                columns[20]?.trim() || null, // factura
                columns[21] ? parseInt(columns[21]) : null, // anioCompra
                columns[22]?.trim() || null, // observaciones
                null, // fecha_compra (se establece como null para evitar problemas)
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                columns[26] ? parseInt(columns[26]) : null, // clasificacionId (columna 26)
                columns[27] ? parseInt(columns[27]) : null // empleadoId (columna 27)
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
                if (loadedCount % 10 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros nuevos...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros nuevos cargados: ${loadedCount}`);
        console.log(`   - Registros existentes saltados: ${skippedCount}`);
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

cargarInventorySimple();






const path = require('path');

async function cargarInventorySimple() {
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

        // Leer el archivo CSV línea por línea
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Saltar el header (primera línea)
        const dataLines = lines.slice(1);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Verificar cuántos registros ya existen
        const existingCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros existentes en la base de datos: ${existingCount.rows[0].count}`);

        let loadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2; // +2 para contar el header y empezar desde la línea 2

            // Dividir la línea por comas
            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                skippedCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                skippedCount++;
                continue;
            }

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                console.log(`⏭️ Saltando registro existente: ${codigoEFC}`);
                skippedCount++;
                continue;
            }

            // Limpiar precios (quitar $ y cambiar , por .)
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Mapear las columnas (CSV tiene 28 columnas, DB espera 29)
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                columns[6] ? parseInt(columns[6]) : null, // anio
                columns[7]?.trim() || null, // ram
                columns[8]?.trim() || null, // discoDuro
                columns[9]?.trim() || null, // sistemaOperativo
                columns[10]?.trim() || null, // status
                columns[11]?.trim() || null, // estado
                columns[12]?.trim() || null, // ubicacionEquipo
                columns[13] ? parseInt(columns[13]) || 1 : 1, // qUsuarios
                columns[14]?.trim() || null, // condicion
                columns[15]?.toLowerCase() === 'true' || columns[15]?.toLowerCase() === 'si' || columns[15] === '1', // repotenciadas
                columns[16]?.trim() || null, // clasificacionObsolescencia
                columns[17]?.trim() || null, // clasificacionRepotenciadas
                columns[18]?.trim() || null, // motivoCompra
                columns[19]?.trim() || null, // proveedor
                columns[20]?.trim() || null, // factura
                columns[21] ? parseInt(columns[21]) : null, // anioCompra
                columns[22]?.trim() || null, // observaciones
                null, // fecha_compra (se establece como null para evitar problemas)
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                columns[26] ? parseInt(columns[26]) : null, // clasificacionId (columna 26)
                columns[27] ? parseInt(columns[27]) : null // empleadoId (columna 27)
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
                if (loadedCount % 10 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros nuevos...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros nuevos cargados: ${loadedCount}`);
        console.log(`   - Registros existentes saltados: ${skippedCount}`);
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

cargarInventorySimple();


const path = require('path');

async function cargarInventorySimple() {
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

        // Leer el archivo CSV línea por línea
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Saltar el header (primera línea)
        const dataLines = lines.slice(1);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Verificar cuántos registros ya existen
        const existingCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros existentes en la base de datos: ${existingCount.rows[0].count}`);

        let loadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2; // +2 para contar el header y empezar desde la línea 2

            // Dividir la línea por comas
            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                skippedCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                skippedCount++;
                continue;
            }

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                console.log(`⏭️ Saltando registro existente: ${codigoEFC}`);
                skippedCount++;
                continue;
            }

            // Limpiar precios (quitar $ y cambiar , por .)
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Mapear las columnas (CSV tiene 28 columnas, DB espera 29)
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                columns[6] ? parseInt(columns[6]) : null, // anio
                columns[7]?.trim() || null, // ram
                columns[8]?.trim() || null, // discoDuro
                columns[9]?.trim() || null, // sistemaOperativo
                columns[10]?.trim() || null, // status
                columns[11]?.trim() || null, // estado
                columns[12]?.trim() || null, // ubicacionEquipo
                columns[13] ? parseInt(columns[13]) || 1 : 1, // qUsuarios
                columns[14]?.trim() || null, // condicion
                columns[15]?.toLowerCase() === 'true' || columns[15]?.toLowerCase() === 'si' || columns[15] === '1', // repotenciadas
                columns[16]?.trim() || null, // clasificacionObsolescencia
                columns[17]?.trim() || null, // clasificacionRepotenciadas
                columns[18]?.trim() || null, // motivoCompra
                columns[19]?.trim() || null, // proveedor
                columns[20]?.trim() || null, // factura
                columns[21] ? parseInt(columns[21]) : null, // anioCompra
                columns[22]?.trim() || null, // observaciones
                null, // fecha_compra (se establece como null para evitar problemas)
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                columns[26] ? parseInt(columns[26]) : null, // clasificacionId (columna 26)
                columns[27] ? parseInt(columns[27]) : null // empleadoId (columna 27)
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
                if (loadedCount % 10 === 0) {
                    console.log(`📝 Cargados ${loadedCount} registros nuevos...`);
                }
            } catch (error) {
                console.error(`❌ Error en línea ${lineNum} (${codigoEFC}): ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga completada:');
        console.log(`   - Registros nuevos cargados: ${loadedCount}`);
        console.log(`   - Registros existentes saltados: ${skippedCount}`);
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

cargarInventorySimple();






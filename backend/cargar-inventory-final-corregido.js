const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function cargarInventoryFinalCorregido() {
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
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido - CORREGIDO para manejar precios con comas
        const cleanedLines = fileContent.split('\n').map(line => {
            // Eliminar espacios alrededor de las comas
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            // CORREGIDO: Limpiar precios con comas decimales $1.159,00 -> 1159.00
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+),(\d{2})/g, '$1$2.$3');
            // Limpiar precios sin comas $1.159 -> 1159
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+)/g, '$1$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;

            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                errorCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = columns[6]?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra - CORREGIDO
            let fecha_compra = null;
            const fechaStr = columns[23]?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO (columna 25)
            let clasificacionId = null;
            const clasificacionStr = columns[25]?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                // Solo usar IDs válidos (1-38)
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO (columna 27, no 26)
            let empleadoId = null;
            const empleadoStr = columns[27]?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                anio, // anio
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
                fecha_compra, // fecha_compra - CORREGIDO
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId - CORREGIDO
                empleadoId // empleadoId - CORREGIDO
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

cargarInventoryFinalCorregido();



const path = require('path');

async function cargarInventoryFinalCorregido() {
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
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido - CORREGIDO para manejar precios con comas
        const cleanedLines = fileContent.split('\n').map(line => {
            // Eliminar espacios alrededor de las comas
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            // CORREGIDO: Limpiar precios con comas decimales $1.159,00 -> 1159.00
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+),(\d{2})/g, '$1$2.$3');
            // Limpiar precios sin comas $1.159 -> 1159
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+)/g, '$1$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;

            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                errorCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = columns[6]?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra - CORREGIDO
            let fecha_compra = null;
            const fechaStr = columns[23]?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO (columna 25)
            let clasificacionId = null;
            const clasificacionStr = columns[25]?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                // Solo usar IDs válidos (1-38)
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO (columna 27, no 26)
            let empleadoId = null;
            const empleadoStr = columns[27]?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                anio, // anio
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
                fecha_compra, // fecha_compra - CORREGIDO
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId - CORREGIDO
                empleadoId // empleadoId - CORREGIDO
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

cargarInventoryFinalCorregido();







const path = require('path');

async function cargarInventoryFinalCorregido() {
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
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido - CORREGIDO para manejar precios con comas
        const cleanedLines = fileContent.split('\n').map(line => {
            // Eliminar espacios alrededor de las comas
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            // CORREGIDO: Limpiar precios con comas decimales $1.159,00 -> 1159.00
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+),(\d{2})/g, '$1$2.$3');
            // Limpiar precios sin comas $1.159 -> 1159
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+)/g, '$1$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;

            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                errorCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = columns[6]?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra - CORREGIDO
            let fecha_compra = null;
            const fechaStr = columns[23]?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO (columna 25)
            let clasificacionId = null;
            const clasificacionStr = columns[25]?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                // Solo usar IDs válidos (1-38)
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO (columna 27, no 26)
            let empleadoId = null;
            const empleadoStr = columns[27]?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                anio, // anio
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
                fecha_compra, // fecha_compra - CORREGIDO
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId - CORREGIDO
                empleadoId // empleadoId - CORREGIDO
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

cargarInventoryFinalCorregido();



const path = require('path');

async function cargarInventoryFinalCorregido() {
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
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido - CORREGIDO para manejar precios con comas
        const cleanedLines = fileContent.split('\n').map(line => {
            // Eliminar espacios alrededor de las comas
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            // CORREGIDO: Limpiar precios con comas decimales $1.159,00 -> 1159.00
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+),(\d{2})/g, '$1$2.$3');
            // Limpiar precios sin comas $1.159 -> 1159
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+)/g, '$1$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        let loadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;

            const columns = line.split(',');
            
            if (columns.length < 28) {
                console.log(`⚠️ Línea ${lineNum} tiene solo ${columns.length} columnas, saltando...`);
                errorCount++;
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                console.log(`⚠️ Línea ${lineNum} no tiene código EFC, saltando...`);
                errorCount++;
                continue;
            }

            // Limpiar precios - CORREGIDO
            const precio = columns[24]?.replace(/[$,]/g, '') || '0';
            const precioLimpio = parseFloat(precio) || 0;

            // Manejar campos vacíos en anio
            let anio = null;
            const anioStr = columns[6]?.trim();
            if (anioStr && anioStr !== 'No aplica' && anioStr !== '' && !isNaN(parseInt(anioStr))) {
                anio = parseInt(anioStr);
            }

            // Manejar fecha_compra - CORREGIDO
            let fecha_compra = null;
            const fechaStr = columns[23]?.trim();
            if (fechaStr && !isNaN(parseInt(fechaStr))) {
                const excelDate = parseInt(fechaStr);
                fecha_compra = new Date(Date.UTC(1899, 11, 30 + excelDate));
            }

            // Manejar clasificacionId - CORREGIDO (columna 25)
            let clasificacionId = null;
            const clasificacionStr = columns[25]?.trim();
            if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
                const id = parseInt(clasificacionStr);
                // Solo usar IDs válidos (1-38)
                if (id >= 1 && id <= 38) {
                    clasificacionId = id;
                }
            }

            // Manejar empleadoId - CORREGIDO (columna 27, no 26)
            let empleadoId = null;
            const empleadoStr = columns[27]?.trim();
            if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
                empleadoId = parseInt(empleadoStr);
            }

            // Mapear las columnas
            const values = [
                codigoEFC, // codigoEFC
                columns[1]?.trim() || null, // marca
                columns[2]?.trim() || null, // modelo
                columns[3]?.trim() || null, // descripcion
                columns[4]?.trim() || null, // serie
                columns[5]?.trim() || null, // procesador
                anio, // anio
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
                fecha_compra, // fecha_compra - CORREGIDO
                precioLimpio, // precioUnitarioSinIgv
                null, // fecha_baja
                null, // motivo_baja
                clasificacionId, // clasificacionId - CORREGIDO
                empleadoId // empleadoId - CORREGIDO
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

cargarInventoryFinalCorregido();







const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function cargarInventoryNuevos() {
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

        // Leer el archivo CSV actualizado
        console.log('📂 Leyendo archivo CSV actualizado...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido (precios y espacios)
        const cleanedLines = fileContent.split('\n').map(line => {
            // Eliminar espacios alrededor de las comas
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            // Limpiar el formato de precio: $X,YY -> X.YY
            cleanedLine = cleanedLine.replace(/\$(\d+),(\d{2})/g, '$1.$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const cleanedCsvContent = cleanedLines.join('\n');

        // Parsear el CSV
        const records = await new Promise((resolve, reject) => {
            const parsedRecords = [];
            parse(cleanedCsvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: ',',
                cast: (value, context) => {
                    if (context.column === 'anio' || context.column === 'anioCompra' || context.column === 'qUsuarios' || context.column === 'clasificacionId' || context.column === 'empleadoId') {
                        return value ? parseInt(value) : null;
                    }
                    if (context.column === 'precioUnitarioSinIgv') {
                        return value ? parseFloat(value) : 0;
                    }
                    if (context.column === 'fecha_compra') {
                        if (!isNaN(value) && value !== '') {
                            const excelDate = parseInt(value);
                            const date = new Date(Date.UTC(1899, 11, 30 + excelDate));
                            return date;
                        }
                        return null;
                    }
                    if (context.column === 'repotenciadas') {
                        return value.toLowerCase() === 'true' || value.toLowerCase() === 'si' || value.toLowerCase() === '1';
                    }
                    return value === '' ? null : value;
                }
            })
            .on('data', (record) => parsedRecords.push(record))
            .on('end', () => resolve(parsedRecords))
            .on('error', reject);
        });

        console.log(`📊 Total de registros en el CSV: ${records.length}`);

        // Verificar cuántos registros ya existen
        const existingCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros existentes en la base de datos: ${existingCount.rows[0].count}`);

        let loadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const [index, record] of records.entries()) {
            const lineNum = index + 2;

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [record.codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                console.log(`⏭️ Saltando registro existente: ${record.codigoEFC}`);
                skippedCount++;
                continue;
            }

            // Mapear las columnas del CSV a las de la base de datos
            const values = [
                record.codigoEFC || null,
                record.marca || null,
                record.modelo || null,
                record.descripcion || null,
                record.serie || null,
                record.procesador || null,
                record.anio || null,
                record.ram || null,
                record.discoDuro || null,
                record.sistemaOPERATIVO || null,
                record.status || null,
                record.estado || null,
                record.ubicacionEquipo || null,
                record.qUsuarios || 1,
                record.condicion || null,
                record.repotenciadas || false,
                record.clasificacionObsolescencia || null,
                record.clasificacionRepotenciadas || null,
                record.motivoCompra || null,
                record.proveedor || null,
                record.factura || null,
                record.anioCompra || null,
                record.observaciones || null,
                record.fecha_compra || null,
                record.precioUnitarioSinIgv || 0,
                null, // fecha_baja
                null, // motivo_baja
                record.clasificacionId || null,
                record.empleadoId || null
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
                console.error(`❌ Error en línea ${lineNum} (${record.codigoEFC}): ${error.message}`);
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

cargarInventoryNuevos();

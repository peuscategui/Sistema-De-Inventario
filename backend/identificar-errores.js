const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function identificarErrores() {
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

        // Leer el archivo CSV
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido
        const cleanedLines = fileContent.split('\n').map(line => {
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            cleanedLine = cleanedLine.replace(/\$(\d+),(\d{2})/g, '$1.$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Obtener todas las clasificaciones disponibles
        const clasificaciones = await client.query('SELECT id FROM clasificacion ORDER BY id');
        const idsClasificacion = new Set(clasificaciones.rows.map(row => row.id));
        console.log(`📊 Clasificaciones disponibles: ${idsClasificacion.size} (IDs: ${Array.from(idsClasificacion).join(', ')})`);

        let erroresNaN = [];
        let erroresClaveForanea = [];
        let duplicados = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;

            const columns = line.split(',');
            
            if (columns.length < 27) {
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) {
                continue;
            }

            // Verificar si el registro ya existe
            const existingRecord = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [codigoEFC]
            );

            if (existingRecord.rows.length > 0) {
                duplicados.push({
                    linea: lineNum,
                    codigo: codigoEFC
                });
                continue;
            }

            // Verificar error NaN en anio
            const anio = columns[6]?.trim();
            if (anio && anio !== 'No aplica' && anio !== '' && isNaN(parseInt(anio))) {
                erroresNaN.push({
                    linea: lineNum,
                    codigo: codigoEFC,
                    anio: anio
                });
            }

            // Verificar error de clave foránea en clasificacionId
            const clasificacionId = columns[25] ? parseInt(columns[25]) : null;
            if (clasificacionId && !idsClasificacion.has(clasificacionId)) {
                erroresClaveForanea.push({
                    linea: lineNum,
                    codigo: codigoEFC,
                    clasificacionId: clasificacionId
                });
            }
        }

        console.log('\n❌ REGISTROS CON ERROR "NaN" (15 registros):');
        erroresNaN.forEach(error => {
            console.log(`   Línea ${error.linea}: ${error.codigo} - Año inválido: "${error.anio}"`);
        });

        console.log('\n❌ REGISTROS CON ERROR DE CLAVE FORÁNEA (4 registros):');
        erroresClaveForanea.forEach(error => {
            console.log(`   Línea ${error.linea}: ${error.codigo} - ClasificacionId inválido: ${error.clasificacionId}`);
        });

        console.log('\n⏭️ REGISTROS DUPLICADOS (1 registro):');
        duplicados.forEach(dup => {
            console.log(`   Línea ${dup.linea}: ${dup.codigo} - Ya existe en la base de datos`);
        });

        console.log('\n📊 RESUMEN:');
        console.log(`   - Errores NaN: ${erroresNaN.length}`);
        console.log(`   - Errores clave foránea: ${erroresClaveForanea.length}`);
        console.log(`   - Duplicados: ${duplicados.length}`);
        console.log(`   - Total de errores: ${erroresNaN.length + erroresClaveForanea.length + duplicados.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

identificarErrores();

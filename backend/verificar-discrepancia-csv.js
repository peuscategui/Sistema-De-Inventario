const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function verificarDiscrepanciaCsv() {
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
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        console.log(`📊 Líneas en el archivo CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos (excluyendo header): ${lines.length - 1}`);

        // Contar registros en la base de datos
        const dbResult = await client.query('SELECT COUNT(*) as total FROM inventory');
        const dbTotal = dbResult.rows[0].total;
        console.log(`📊 Registros en la base de datos: ${dbTotal}`);

        const diferencia = (lines.length - 1) - dbTotal;
        console.log(`📊 Diferencia: ${diferencia} líneas no cargadas`);

        if (diferencia > 0) {
            console.log('\n🔍 INVESTIGANDO LÍNEAS NO CARGADAS...');
            
            // Obtener todos los códigos EFC de la base de datos
            const dbCodigosResult = await client.query('SELECT "codigoEFC" FROM inventory');
            const dbCodigos = new Set(dbCodigosResult.rows.map(row => row.codigoEFC));

            // Procesar el CSV para encontrar líneas no cargadas
            const processedContent = fileContent
                .replace(/(\d+),(\d{2})\s*,/g, '$1.$2,')
                .replace(/,(\s*)/g, ',');

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

            const noCargados = [];
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const codigoEFC = record.codigoEFC?.trim();
                
                if (codigoEFC && !dbCodigos.has(codigoEFC)) {
                    noCargados.push({
                        linea: i + 2, // +1 for header, +1 for 0-based index
                        codigoEFC: codigoEFC,
                        marca: record.marca,
                        modelo: record.modelo,
                        clasificacionId: record.clasificacionId,
                        empleadoId: record.empleadoId
                    });
                }
            }

            console.log(`\n❌ REGISTROS NO CARGADOS (${noCargados.length}):`);
            console.log('================================================================================');
            
            noCargados.forEach((item, index) => {
                console.log(`\n${index + 1}. Línea ${item.linea}:`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   Marca: ${item.marca}`);
                console.log(`   Modelo: ${item.modelo}`);
                console.log(`   Clasificación ID: ${item.clasificacionId}`);
                console.log(`   Empleado ID: ${item.empleadoId}`);
            });

            // Verificar si hay líneas duplicadas en el CSV
            console.log('\n🔍 VERIFICANDO DUPLICADOS EN EL CSV...');
            const codigosCsv = records.map(r => r.codigoEFC?.trim()).filter(c => c);
            const codigosUnicos = new Set(codigosCsv);
            const duplicados = codigosCsv.length - codigosUnicos.size;
            
            console.log(`📊 Códigos EFC en CSV: ${codigosCsv.length}`);
            console.log(`📊 Códigos únicos en CSV: ${codigosUnicos.size}`);
            console.log(`📊 Duplicados en CSV: ${duplicados}`);

            if (duplicados > 0) {
                console.log('\n🔍 BUSCANDO DUPLICADOS ESPECÍFICOS...');
                const codigoCounts = {};
                codigosCsv.forEach(codigo => {
                    codigoCounts[codigo] = (codigoCounts[codigo] || 0) + 1;
                });
                
                Object.entries(codigoCounts).forEach(([codigo, count]) => {
                    if (count > 1) {
                        console.log(`   "${codigo}" aparece ${count} veces`);
                    }
                });
            }

        } else {
            console.log('✅ Todos los registros del CSV están en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarDiscrepanciaCsv();

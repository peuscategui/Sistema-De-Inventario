const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');

async function debugCsvParser() {
    try {
        console.log('🔍 DEBUGGING CSV PARSER');
        console.log('========================');

        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Usar csv-parse para manejar comas dentro de campos
        const records = [];
        await new Promise((resolve, reject) => {
            parse(fileContent, {
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

        // Analizar el primer registro
        const primerRegistro = records[0];
        console.log('\n📋 PRIMER REGISTRO:');
        console.log('==================');
        
        console.log('🔍 TODOS LOS CAMPOS:');
        Object.keys(primerRegistro).forEach(key => {
            console.log(`   ${key}: "${primerRegistro[key]}"`);
        });

        console.log('\n🎯 CAMPOS ESPECÍFICOS:');
        console.log(`   codigoEFC: "${primerRegistro.codigoEFC}"`);
        console.log(`   clasificacionId: "${primerRegistro.clasificacionId}"`);
        console.log(`   empleadoId: "${primerRegistro.empleadoId}"`);

        // Procesar como en el script
        const clasificacionStr = primerRegistro.clasificacionId?.trim();
        const empleadoStr = primerRegistro.empleadoId?.trim();
        
        console.log('\n🔧 PROCESAMIENTO:');
        console.log(`   clasificacionStr: "${clasificacionStr}"`);
        console.log(`   empleadoStr: "${empleadoStr}"`);
        
        let clasificacionId = null;
        if (clasificacionStr && clasificacionStr !== '00' && clasificacionStr !== '00 ' && !isNaN(parseInt(clasificacionStr))) {
            const id = parseInt(clasificacionStr);
            if (id >= 1 && id <= 38) {
                clasificacionId = id;
            }
        }
        
        let empleadoId = null;
        if (empleadoStr && !isNaN(parseInt(empleadoStr))) {
            empleadoId = parseInt(empleadoStr);
        }
        
        console.log('\n✅ RESULTADO FINAL:');
        console.log(`   clasificacionId: ${clasificacionId}`);
        console.log(`   empleadoId: ${empleadoId}`);

        // También mostrar las primeras 5 líneas del CSV original
        console.log('\n📄 PRIMERAS 5 LÍNEAS DEL CSV ORIGINAL:');
        const lines = fileContent.split('\n').slice(0, 5);
        lines.forEach((line, index) => {
            console.log(`   Línea ${index + 1}: ${line}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCsvParser();

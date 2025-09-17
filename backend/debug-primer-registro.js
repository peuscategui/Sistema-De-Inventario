const fs = require('fs').promises;
const path = require('path');

async function debugPrimerRegistro() {
    try {
        console.log('🔍 DEBUGGING PRIMER REGISTRO');
        console.log('============================');

        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido igual que en el script
        const cleanedLines = fileContent.split('\n').map(line => {
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+),(\d{2})/g, '$1$2.$3');
            cleanedLine = cleanedLine.replace(/\$(\d+)\.(\d+)/g, '$1$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Analizar el primer registro
        const primerRegistro = dataLines[0];
        console.log('\n📋 PRIMER REGISTRO:');
        console.log(`Línea completa: ${primerRegistro}`);
        
        const columns = primerRegistro.split(',');
        console.log(`\n📊 Total de columnas: ${columns.length}`);
        
        console.log('\n🔍 COLUMNAS RELEVANTES:');
        for (let i = 0; i < columns.length; i++) {
            console.log(`Columna ${i}: "${columns[i]}"`);
        }

        console.log('\n🎯 VALORES ESPECÍFICOS:');
        console.log(`Columna 25 (clasificacionId): "${columns[25]}"`);
        console.log(`Columna 26 (empleadoId): "${columns[26]}"`);

        // Aplicar la misma lógica del script
        const clasificacionStr = columns[25]?.trim();
        const empleadoStr = columns[26]?.trim();
        
        console.log('\n🔧 PROCESAMIENTO:');
        console.log(`clasificacionStr: "${clasificacionStr}"`);
        console.log(`empleadoStr: "${empleadoStr}"`);
        
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
        console.log(`clasificacionId: ${clasificacionId}`);
        console.log(`empleadoId: ${empleadoId}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugPrimerRegistro();

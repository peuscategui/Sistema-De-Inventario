const fs = require('fs').promises;
const path = require('path');

async function buscarCamPiso3Csv() {
    try {
        console.log('🔍 BUSCANDO CAM PISO 3 GPS EN EL CSV');
        console.log('====================================');

        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el CSV: ${lines.length}`);

        // Buscar líneas que contengan "CAM" y "PISO"
        const matchingLines = [];
        lines.forEach((line, index) => {
            if (line.includes('CAM') && line.includes('PISO')) {
                matchingLines.push({ lineNumber: index + 1, content: line });
            }
        });

        console.log(`\n📋 Líneas encontradas con CAM y PISO: ${matchingLines.length}`);
        
        matchingLines.forEach((match, index) => {
            console.log(`\n📋 LÍNEA ${index + 1} (${match.lineNumber}):`);
            console.log(`   Contenido: ${match.content}`);
            
            const columns = match.content.split(',');
            console.log(`   Total de columnas: ${columns.length}`);
            
            if (columns.length >= 27) {
                console.log(`   Código EFC: ${columns[0]}`);
                console.log(`   ClasificacionId (col 25): ${columns[25]}`);
                console.log(`   EmpleadoId (col 26): ${columns[26]}`);
                if (columns.length > 27) {
                    console.log(`   Columna extra (27): ${columns[27]}`);
                }
            }
        });

        // También buscar cualquier línea que contenga "CAM"
        console.log('\n🔍 Buscando cualquier línea con CAM...');
        const camLines = [];
        lines.forEach((line, index) => {
            if (line.includes('CAM')) {
                camLines.push({ lineNumber: index + 1, content: line });
            }
        });

        console.log(`📊 Líneas con CAM: ${camLines.length}`);
        
        camLines.slice(0, 5).forEach((match, index) => {
            console.log(`\n📋 LÍNEA ${index + 1} (${match.lineNumber}):`);
            console.log(`   Contenido: ${match.content}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

buscarCamPiso3Csv();

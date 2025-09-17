const fs = require('fs').promises;
const path = require('path');

async function verificarCsvDetallado() {
    try {
        console.log('🔍 VERIFICACIÓN DETALLADA DEL CSV');
        console.log('==================================');

        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas: ${lines.length}`);
        
        // Analizar el header
        const header = lines[0];
        const headerColumns = header.split(',');
        console.log(`\n📋 HEADER (${headerColumns.length} columnas):`);
        headerColumns.forEach((col, index) => {
            console.log(`   ${index}: "${col}"`);
        });

        // Analizar la primera línea de datos
        const primeraLinea = lines[1];
        const primeraColumns = primeraLinea.split(',');
        console.log(`\n📋 PRIMERA LÍNEA DE DATOS (${primeraColumns.length} columnas):`);
        primeraColumns.forEach((col, index) => {
            console.log(`   ${index}: "${col}"`);
        });

        // Buscar las columnas específicas
        console.log('\n🎯 COLUMNAS ESPECÍFICAS:');
        console.log(`   Columna 25 (clasificacionId): "${primeraColumns[25]}"`);
        console.log(`   Columna 26 (empleadoId): "${primeraColumns[26]}"`);
        console.log(`   Columna 27: "${primeraColumns[27] || 'NO EXISTE'}"`);

        // Verificar si hay más columnas
        if (primeraColumns.length > 27) {
            console.log('\n⚠️ HAY MÁS DE 27 COLUMNAS:');
            for (let i = 27; i < primeraColumns.length; i++) {
                console.log(`   Columna ${i}: "${primeraColumns[i]}"`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verificarCsvDetallado();

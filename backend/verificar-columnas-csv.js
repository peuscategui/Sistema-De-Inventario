const fs = require('fs');
const path = require('path');

function verificarColumnasCSV() {
    try {
        console.log('📂 Verificando columnas del archivo CSV...');
        
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory_limpio.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Obtener headers
        const headers = lines[0].split(',');
        console.log(`📋 Total de columnas en header: ${headers.length}`);
        console.log('📋 Headers:');
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. ${header}`);
        });
        
        // Verificar una línea de datos
        if (lines.length > 1) {
            const dataLine = lines[1].split(',');
            console.log(`\n📊 Columnas en primera línea de datos: ${dataLine.length}`);
            console.log('📊 Primeros 10 campos de la primera línea:');
            dataLine.slice(0, 10).forEach((field, index) => {
                console.log(`  ${index + 1}. "${field}"`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarColumnasCSV();

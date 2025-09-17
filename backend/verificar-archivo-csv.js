const fs = require('fs').promises;
const path = require('path');

async function verificarArchivoCSV() {
    try {
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        console.log('📂 Leyendo archivo desde:', csvFilePath);
        
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n');
        
        console.log(`📊 Total de líneas (incluyendo vacías): ${lines.length}`);
        
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        console.log(`📊 Líneas no vacías: ${nonEmptyLines.length}`);
        
        // Mostrar las primeras 3 líneas
        console.log('\n📝 Primeras 3 líneas:');
        for (let i = 0; i < Math.min(3, lines.length); i++) {
            console.log(`${i + 1}: ${lines[i].substring(0, 100)}...`);
        }
        
        // Mostrar las últimas 3 líneas
        console.log('\n📝 Últimas 3 líneas:');
        for (let i = Math.max(0, lines.length - 3); i < lines.length; i++) {
            console.log(`${i + 1}: ${lines[i].substring(0, 100)}...`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verificarArchivoCSV();

const fs = require('fs').promises;
const path = require('path');

async function debugCsv() {
    try {
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        
        const lines = fileContent.split('\n');
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Mostrar las primeras 5 líneas
        console.log('\n📝 Primeras 5 líneas:');
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
        
        // Mostrar las últimas 5 líneas
        console.log('\n📝 Últimas 5 líneas:');
        for (let i = Math.max(0, lines.length - 5); i < lines.length; i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
        
        // Contar líneas no vacías
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        console.log(`\n📊 Líneas no vacías: ${nonEmptyLines.length}`);
        
        // Verificar si hay problemas con comillas o caracteres especiales
        const problematicLines = lines.filter(line => 
            line.includes('"') || 
            line.includes("'") || 
            line.includes('\r') ||
            line.length > 1000
        );
        
        if (problematicLines.length > 0) {
            console.log(`\n⚠️ Líneas problemáticas encontradas: ${problematicLines.length}`);
            problematicLines.slice(0, 3).forEach((line, index) => {
                console.log(`Problema ${index + 1}: ${line.substring(0, 100)}...`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCsv();

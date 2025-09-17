const fs = require('fs').promises;
const path = require('path');

async function verificarNuevoCsv() {
    try {
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en el nuevo CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos (excluyendo header): ${lines.length - 1}`);
        
        // Verificar el header
        const header = lines[0];
        const headerColumns = header.split(',');
        console.log(`\n📋 HEADER (${headerColumns.length} columnas):`);
        console.log(header);
        
        // Verificar las primeras 5 líneas de datos
        console.log('\n🔍 PRIMERAS 5 LÍNEAS DE DATOS:');
        for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
            const line = lines[i];
            const columns = line.split(',');
            console.log(`\nLínea ${i + 1} (${columns.length} columnas):`);
            console.log(`   ${line}`);
            
            if (columns.length !== headerColumns.length) {
                console.log(`   ❌ PROBLEMA: Esperaba ${headerColumns.length} columnas, tiene ${columns.length}`);
            }
        }
        
        // Verificar la línea problemática (línea 27)
        if (lines.length > 27) {
            const problemLine = lines[27];
            const problemColumns = problemLine.split(',');
            console.log(`\n❌ LÍNEA PROBLEMÁTICA 27 (${problemColumns.length} columnas):`);
            console.log(`   ${problemLine}`);
            console.log(`   Esperaba: ${headerColumns.length} columnas`);
            console.log(`   Tiene: ${problemColumns.length} columnas`);
            
            // Mostrar cada columna
            problemColumns.forEach((col, index) => {
                console.log(`      Columna ${index + 1}: "${col}"`);
            });
        }
        
        // Verificar si hay inconsistencias en el número de columnas
        console.log('\n🔍 VERIFICANDO INCONSISTENCIAS EN COLUMNAS:');
        const columnCounts = {};
        const problemLines = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const columns = line.split(',');
            const count = columns.length;
            
            columnCounts[count] = (columnCounts[count] || 0) + 1;
            
            if (count !== headerColumns.length) {
                problemLines.push({
                    line: i + 1,
                    columns: count,
                    content: line.substring(0, 100) + '...'
                });
            }
        }
        
        console.log('\n📊 DISTRIBUCIÓN DE COLUMNAS:');
        Object.entries(columnCounts).forEach(([count, frequency]) => {
            console.log(`   ${count} columnas: ${frequency} líneas`);
        });
        
        if (problemLines.length > 0) {
            console.log(`\n❌ LÍNEAS CON PROBLEMAS (${problemLines.length}):`);
            problemLines.slice(0, 10).forEach((item, index) => {
                console.log(`   ${index + 1}. Línea ${item.line}: ${item.columns} columnas - ${item.content}`);
            });
            if (problemLines.length > 10) {
                console.log(`   ... y ${problemLines.length - 10} líneas más con problemas`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verificarNuevoCsv();

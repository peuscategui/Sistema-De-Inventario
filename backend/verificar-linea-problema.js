const fs = require('fs').promises;
const path = require('path');

async function verificarLineaProblema() {
    try {
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${lines.length - 1}`);
        
        // Verificar las líneas alrededor de la 15 (índice 14)
        const lineasProblema = [13, 14, 15, 16, 17]; // Líneas 14, 15, 16, 17, 18
        
        console.log('\n🔍 VERIFICANDO LÍNEAS PROBLEMÁTICAS:');
        console.log('================================================================================');
        
        for (const lineaIndex of lineasProblema) {
            const linea = lines[lineaIndex];
            if (linea) {
                const columnas = linea.split(',');
                console.log(`\nLínea ${lineaIndex + 1} (índice ${lineaIndex}):`);
                console.log(`   Total de columnas: ${columnas.length}`);
                console.log(`   Contenido: ${linea}`);
                
                if (columnas.length !== 27) {
                    console.log(`   ❌ PROBLEMA: Esperaba 27 columnas, tiene ${columnas.length}`);
                    
                    // Mostrar cada columna
                    columnas.forEach((col, index) => {
                        console.log(`      Columna ${index + 1}: "${col}"`);
                    });
                } else {
                    console.log(`   ✅ OK: Tiene 27 columnas`);
                }
            }
        }
        
        // Verificar el header para confirmar que son 27 columnas
        console.log('\n🔍 VERIFICANDO HEADER:');
        const header = lines[0];
        const headerColumnas = header.split(',');
        console.log(`Header tiene ${headerColumnas.length} columnas`);
        console.log(`Header: ${header}`);
        
        // Buscar todas las líneas con problemas
        console.log('\n🔍 BUSCANDO TODAS LAS LÍNEAS CON PROBLEMAS:');
        const lineasConProblemas = [];
        
        for (let i = 1; i < lines.length; i++) { // Empezar desde 1 (saltar header)
            const linea = lines[i];
            const columnas = linea.split(',');
            if (columnas.length !== 27) {
                lineasConProblemas.push({
                    numero: i + 1,
                    columnas: columnas.length,
                    contenido: linea
                });
            }
        }
        
        console.log(`\n📊 Líneas con problemas encontradas: ${lineasConProblemas.length}`);
        lineasConProblemas.forEach((item, index) => {
            console.log(`\n${index + 1}. Línea ${item.numero}:`);
            console.log(`   Columnas: ${item.columnas} (esperaba 27)`);
            console.log(`   Contenido: ${item.contenido}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verificarLineaProblema();

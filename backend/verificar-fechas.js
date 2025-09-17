const fs = require('fs').promises;
const path = require('path');

async function verificarFechas() {
    try {
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header

        console.log('🔍 ANÁLISIS DE FECHAS EN EL CSV:');
        console.log('='.repeat(60));

        // Revisar las primeras 10 líneas para ver el formato de fechas
        for (let i = 0; i < Math.min(10, dataLines.length); i++) {
            const line = dataLines[i];
            const columns = line.split(',');
            
            if (columns.length >= 24) {
                const codigoEFC = columns[0];
                const fecha_compra = columns[23]; // Columna 24 (índice 23)
                
                console.log(`\n📋 ${codigoEFC}:`);
                console.log(`   Fecha compra (columna 24): "${fecha_compra}"`);
                
                // Intentar parsear como número de Excel
                if (fecha_compra && !isNaN(parseInt(fecha_compra))) {
                    const excelDate = parseInt(fecha_compra);
                    const date = new Date(Date.UTC(1899, 11, 30 + excelDate));
                    console.log(`   Convertido a fecha: ${date.toISOString().split('T')[0]}`);
                } else if (fecha_compra && fecha_compra !== '') {
                    console.log(`   Formato no numérico: "${fecha_compra}"`);
                } else {
                    console.log(`   Campo vacío`);
                }
            }
        }

        // Buscar líneas con fechas específicas
        console.log('\n🔍 BÚSQUEDA DE FECHAS ESPECÍFICAS:');
        console.log('='.repeat(40));

        const fechasEncontradas = new Set();
        dataLines.forEach((line, index) => {
            const columns = line.split(',');
            if (columns.length >= 24) {
                const fecha_compra = columns[23];
                if (fecha_compra && fecha_compra !== '') {
                    fechasEncontradas.add(fecha_compra);
                }
            }
        });

        console.log(`📊 Fechas únicas encontradas: ${fechasEncontradas.size}`);
        const fechasArray = Array.from(fechasEncontradas).slice(0, 20); // Mostrar solo las primeras 20
        fechasArray.forEach(fecha => {
            console.log(`   "${fecha}"`);
        });

        // Verificar si hay fechas en formato de texto
        console.log('\n🔍 VERIFICACIÓN DE FORMATOS DE FECHA:');
        console.log('='.repeat(40));

        let fechasNumericas = 0;
        let fechasVacias = 0;
        let fechasTexto = 0;

        dataLines.forEach((line, index) => {
            const columns = line.split(',');
            if (columns.length >= 24) {
                const fecha_compra = columns[23];
                if (fecha_compra && fecha_compra !== '') {
                    if (!isNaN(parseInt(fecha_compra))) {
                        fechasNumericas++;
                    } else {
                        fechasTexto++;
                        if (fechasTexto <= 5) { // Mostrar solo las primeras 5 fechas de texto
                            console.log(`   Línea ${index + 2}: "${fecha_compra}"`);
                        }
                    }
                } else {
                    fechasVacias++;
                }
            }
        });

        console.log(`\n📊 Resumen de fechas:`);
        console.log(`   - Fechas numéricas (Excel): ${fechasNumericas}`);
        console.log(`   - Fechas vacías: ${fechasVacias}`);
        console.log(`   - Fechas en formato texto: ${fechasTexto}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verificarFechas();

const fs = require('fs');
const path = require('path');

function corregirInventoryCSV() {
    try {
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log('🔧 Corrigiendo problemas en 05_inventory.csv...\n');
        
        const lineasCorregidas = [];
        let correcciones = 0;
        
        // Procesar cada línea
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (i === 0) {
                // Header - mantener igual
                lineasCorregidas.push(line);
                continue;
            }
            
            const columns = line.split(',');
            const codigoEFC = columns[0];
            
            // Corregir problema de estado
            if (columns.length > 12) {
                const estado = columns[12];
                const ubicacion = columns[13];
                
                // Si el estado es "Surquillo", moverlo a ubicación y poner estado correcto
                if (estado === 'Surquillo') {
                    columns[12] = 'ASIGNADO'; // Estado correcto
                    columns[13] = 'SURQUILLO'; // Ubicación correcta
                    correcciones++;
                    console.log(`✅ Corregido ${codigoEFC}: Estado "Surquillo" → "ASIGNADO", Ubicación → "SURQUILLO"`);
                }
            }
            
            // Corregir empleadoId vacío (LT-00318)
            if (codigoEFC === 'LT-00318' && (!columns[columns.length - 1] || columns[columns.length - 1].trim() === '')) {
                // Asignar empleadoId temporal (puedes cambiarlo después)
                columns[columns.length - 1] = '11'; // EmpleadoId por defecto
                correcciones++;
                console.log(`✅ Corregido ${codigoEFC}: EmpleadoId vacío → "11"`);
            }
            
            lineasCorregidas.push(columns.join(','));
        }
        
        // Crear archivo corregido
        const contenidoCorregido = lineasCorregidas.join('\n');
        const archivoCorregido = path.join(__dirname, 'excel-templates', '05_inventory_corregido.csv');
        
        fs.writeFileSync(archivoCorregido, contenidoCorregido, 'utf8');
        
        console.log(`\n🎉 Correcciones completadas:`);
        console.log(`   - Total de correcciones: ${correcciones}`);
        console.log(`   - Archivo corregido guardado como: 05_inventory_corregido.csv`);
        console.log(`\n📋 Resumen de correcciones:`);
        console.log(`   - Estados "Surquillo" → "ASIGNADO"`);
        console.log(`   - Ubicaciones actualizadas a "SURQUILLO"`);
        console.log(`   - EmpleadoId vacío de LT-00318 → "11"`);
        
    } catch (error) {
        console.error('❌ Error corrigiendo el archivo:', error);
    }
}

corregirInventoryCSV();

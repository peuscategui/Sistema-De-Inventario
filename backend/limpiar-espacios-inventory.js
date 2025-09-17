const fs = require('fs');
const path = require('path');

function limpiarEspaciosInventory() {
    try {
        console.log('🧹 Limpiando espacios en 05_inventory.csv...\n');
        
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');
        
        console.log(`📊 Total de líneas: ${lines.length}`);
        
        const lineasLimpias = [];
        let correcciones = 0;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (!line) {
                lineasLimpias.push(line);
                continue;
            }
            
            // Si es el header, mantenerlo igual
            if (i === 0) {
                lineasLimpias.push(line);
                continue;
            }
            
            const originalLine = line;
            
            // Dividir por comas y limpiar cada campo
            const columns = line.split(',');
            const cleanedColumns = columns.map(column => {
                // Limpiar espacios al inicio y final
                let cleaned = column.trim();
                
                // Limpiar espacios múltiples por espacios simples
                cleaned = cleaned.replace(/\s+/g, ' ');
                
                // Casos específicos de limpieza
                if (cleaned === '') {
                    return '';
                }
                
                // Limpiar estados inconsistentes
                if (cleaned === 'Asignada') {
                    cleaned = 'ASIGNADA';
                } else if (cleaned === 'Asignado') {
                    cleaned = 'ASIGNADO';
                }
                
                // Limpiar ubicaciones
                if (cleaned === 'Surquillo') {
                    cleaned = 'SURQUILLO';
                } else if (cleaned === 'Chorrillos') {
                    cleaned = 'CHORRILLOS';
                }
                
                // Limpiar condiciones
                if (cleaned === 'OBSOLETO') {
                    cleaned = 'OBSOLETA';
                }
                
                // Limpiar precios (quitar $ y espacios)
                if (cleaned.includes('$') && cleaned.includes(',')) {
                    cleaned = cleaned.replace(/\$|\s/g, '').replace(',', '.');
                }
                
                return cleaned;
            });
            
            const cleanedLine = cleanedColumns.join(',');
            
            if (originalLine !== cleanedLine) {
                correcciones++;
                console.log(`✅ Línea ${i + 1} corregida:`);
                console.log(`   Antes: ${originalLine.substring(0, 80)}...`);
                console.log(`   Después: ${cleanedLine.substring(0, 80)}...`);
                console.log('');
            }
            
            lineasLimpias.push(cleanedLine);
        }
        
        // Crear archivo limpio
        const contenidoLimpio = lineasLimpias.join('\n');
        const archivoLimpio = path.join(__dirname, 'excel-templates', '05_inventory_limpio.csv');
        
        fs.writeFileSync(archivoLimpio, contenidoLimpio, 'utf8');
        
        console.log(`🎉 Limpieza completada:`);
        console.log(`   - Total de líneas procesadas: ${lines.length}`);
        console.log(`   - Líneas corregidas: ${correcciones}`);
        console.log(`   - Archivo limpio guardado como: 05_inventory_limpio.csv`);
        
        // Mostrar estadísticas de problemas encontrados
        console.log('\n📊 Problemas corregidos:');
        console.log('   - Espacios al inicio y final de campos');
        console.log('   - Espacios múltiples convertidos a simples');
        console.log('   - Estados estandarizados (Asignada → ASIGNADA)');
        console.log('   - Ubicaciones estandarizadas (Surquillo → SURQUILLO)');
        console.log('   - Condiciones estandarizadas (OBSOLETO → OBSOLETA)');
        console.log('   - Precios limpiados (quitar $ y espacios)');
        
    } catch (error) {
        console.error('❌ Error limpiando espacios:', error);
    }
}

limpiarEspaciosInventory();

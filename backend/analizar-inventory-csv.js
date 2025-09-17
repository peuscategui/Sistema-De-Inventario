const fs = require('fs');
const path = require('path');

async function analizarInventoryCSV() {
    try {
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');
        
        console.log('🔍 Analizando archivo 05_inventory.csv...\n');
        console.log(`📊 Total de líneas: ${lines.length}`);
        
        // Obtener headers
        const headers = lines[0].split(',');
        console.log('📋 Headers encontrados:');
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. ${header}`);
        });
        
        console.log('\n🔍 Analizando problemas en los datos...\n');
        
        const problemas = {
            empleadoIdVacio: [],
            clasificacionIdVacio: [],
            precioMalFormato: [],
            estadoInconsistente: [],
            condicionInconsistente: [],
            ubicacionInconsistente: [],
            fechaCompraMalFormato: []
        };
        
        // Analizar cada línea (saltando el header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split(',');
            const codigoEFC = columns[0];
            
            // Verificar empleadoId (columna 27)
            if (columns.length > 27) {
                const empleadoId = columns[27];
                if (!empleadoId || empleadoId.trim() === '') {
                    problemas.empleadoIdVacio.push({ linea: i + 1, codigo: codigoEFC });
                }
            }
            
            // Verificar clasificacionId (columna 26)
            if (columns.length > 26) {
                const clasificacionId = columns[26];
                if (!clasificacionId || clasificacionId.trim() === '') {
                    problemas.clasificacionIdVacio.push({ linea: i + 1, codigo: codigoEFC });
                }
            }
            
            // Verificar precio (columna 25)
            if (columns.length > 25) {
                const precio = columns[25];
                if (precio && precio.includes('$') && precio.includes(',')) {
                    problemas.precioMalFormato.push({ linea: i + 1, codigo: codigoEFC, precio });
                }
            }
            
            // Verificar estado (columna 12)
            if (columns.length > 12) {
                const estado = columns[12];
                if (estado && !['ASIGNADO', 'ASIGNADA', 'BAJA', 'STOCK', 'EN SERVICIO', 'DONACION'].includes(estado.trim())) {
                    problemas.estadoInconsistente.push({ linea: i + 1, codigo: codigoEFC, estado });
                }
            }
            
            // Verificar condición (columna 15)
            if (columns.length > 15) {
                const condicion = columns[15];
                if (condicion && !['OPERATIVO', 'OBSOLETO', 'OBSOLETA', 'AVERIADO'].includes(condicion.trim())) {
                    problemas.condicionInconsistente.push({ linea: i + 1, codigo: codigoEFC, condicion });
                }
            }
            
            // Verificar ubicación (columna 13)
            if (columns.length > 13) {
                const ubicacion = columns[13];
                if (ubicacion && ubicacion.includes(' ')) {
                    problemas.ubicacionInconsistente.push({ linea: i + 1, codigo: codigoEFC, ubicacion });
                }
            }
        }
        
        // Mostrar resumen de problemas
        console.log('📊 RESUMEN DE PROBLEMAS ENCONTRADOS:\n');
        
        if (problemas.empleadoIdVacio.length > 0) {
            console.log(`❌ EmpleadoId vacío: ${problemas.empleadoIdVacio.length} registros`);
            console.log('   Ejemplos:');
            problemas.empleadoIdVacio.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo}`);
            });
            console.log('');
        }
        
        if (problemas.clasificacionIdVacio.length > 0) {
            console.log(`❌ ClasificacionId vacío: ${problemas.clasificacionIdVacio.length} registros`);
            console.log('   Ejemplos:');
            problemas.clasificacionIdVacio.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo}`);
            });
            console.log('');
        }
        
        if (problemas.precioMalFormato.length > 0) {
            console.log(`❌ Precio mal formateado: ${problemas.precioMalFormato.length} registros`);
            console.log('   Ejemplos:');
            problemas.precioMalFormato.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo} - ${p.precio}`);
            });
            console.log('');
        }
        
        if (problemas.estadoInconsistente.length > 0) {
            console.log(`❌ Estado inconsistente: ${problemas.estadoInconsistente.length} registros`);
            console.log('   Ejemplos:');
            problemas.estadoInconsistente.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo} - "${p.estado}"`);
            });
            console.log('');
        }
        
        if (problemas.condicionInconsistente.length > 0) {
            console.log(`❌ Condición inconsistente: ${problemas.condicionInconsistente.length} registros`);
            console.log('   Ejemplos:');
            problemas.condicionInconsistente.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo} - "${p.condicion}"`);
            });
            console.log('');
        }
        
        if (problemas.ubicacionInconsistente.length > 0) {
            console.log(`❌ Ubicación con espacios: ${problemas.ubicacionInconsistente.length} registros`);
            console.log('   Ejemplos:');
            problemas.ubicacionInconsistente.slice(0, 5).forEach(p => {
                console.log(`     Línea ${p.linea}: ${p.codigo} - "${p.ubicacion}"`);
            });
            console.log('');
        }
        
        // Mostrar estadísticas generales
        console.log('📊 ESTADÍSTICAS GENERALES:');
        console.log(`   Total de registros analizados: ${lines.length - 1}`);
        console.log(`   Total de problemas encontrados: ${
            problemas.empleadoIdVacio.length + 
            problemas.clasificacionIdVacio.length + 
            problemas.precioMalFormato.length + 
            problemas.estadoInconsistente.length + 
            problemas.condicionInconsistente.length + 
            problemas.ubicacionInconsistente.length
        }`);
        
    } catch (error) {
        console.error('❌ Error analizando el archivo:', error);
    }
}

analizarInventoryCSV();

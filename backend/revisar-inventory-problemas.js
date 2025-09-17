const fs = require('fs');
const path = require('path');

function revisarProblemas() {
    try {
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log('🔍 Revisando problemas en 05_inventory.csv...\n');
        console.log(`📊 Total de líneas: ${lines.length}\n`);
        
        let problemas = {
            empleadoIdVacio: 0,
            clasificacionIdVacio: 0,
            precioMalFormato: 0,
            estadoInconsistente: 0,
            condicionInconsistente: 0
        };
        
        let ejemplos = {
            empleadoIdVacio: [],
            clasificacionIdVacio: [],
            precioMalFormato: [],
            estadoInconsistente: [],
            condicionInconsistente: []
        };
        
        // Revisar cada línea (saltando header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split(',');
            const codigoEFC = columns[0];
            
            // Verificar empleadoId (última columna)
            const empleadoId = columns[columns.length - 1];
            if (!empleadoId || empleadoId.trim() === '') {
                problemas.empleadoIdVacio++;
                if (ejemplos.empleadoIdVacio.length < 5) {
                    ejemplos.empleadoIdVacio.push({ linea: i + 1, codigo: codigoEFC });
                }
            }
            
            // Verificar clasificacionId (penúltima columna)
            const clasificacionId = columns[columns.length - 2];
            if (!clasificacionId || clasificacionId.trim() === '') {
                problemas.clasificacionIdVacio++;
                if (ejemplos.clasificacionIdVacio.length < 5) {
                    ejemplos.clasificacionIdVacio.push({ linea: i + 1, codigo: codigoEFC });
                }
            }
            
            // Verificar precio (columna 25)
            if (columns.length > 25) {
                const precio = columns[25];
                if (precio && (precio.includes('$') || precio.includes(','))) {
                    problemas.precioMalFormato++;
                    if (ejemplos.precioMalFormato.length < 5) {
                        ejemplos.precioMalFormato.push({ linea: i + 1, codigo: codigoEFC, precio });
                    }
                }
            }
            
            // Verificar estado (columna 12)
            if (columns.length > 12) {
                const estado = columns[12];
                if (estado && !['ASIGNADO', 'ASIGNADA', 'BAJA', 'STOCK', 'EN SERVICIO', 'DONACION'].includes(estado.trim())) {
                    problemas.estadoInconsistente++;
                    if (ejemplos.estadoInconsistente.length < 5) {
                        ejemplos.estadoInconsistente.push({ linea: i + 1, codigo: codigoEFC, estado });
                    }
                }
            }
            
            // Verificar condición (columna 15)
            if (columns.length > 15) {
                const condicion = columns[15];
                if (condicion && !['OPERATIVO', 'OBSOLETO', 'OBSOLETA', 'AVERIADO'].includes(condicion.trim())) {
                    problemas.condicionInconsistente++;
                    if (ejemplos.condicionInconsistente.length < 5) {
                        ejemplos.condicionInconsistente.push({ linea: i + 1, codigo: codigoEFC, condicion });
                    }
                }
            }
        }
        
        // Mostrar resultados
        console.log('📊 PROBLEMAS ENCONTRADOS:\n');
        
        if (problemas.empleadoIdVacio > 0) {
            console.log(`❌ EmpleadoId vacío: ${problemas.empleadoIdVacio} registros`);
            console.log('   Ejemplos:');
            ejemplos.empleadoIdVacio.forEach(e => console.log(`     Línea ${e.linea}: ${e.codigo}`));
            console.log('');
        }
        
        if (problemas.clasificacionIdVacio > 0) {
            console.log(`❌ ClasificacionId vacío: ${problemas.clasificacionIdVacio} registros`);
            console.log('   Ejemplos:');
            ejemplos.clasificacionIdVacio.forEach(e => console.log(`     Línea ${e.linea}: ${e.codigo}`));
            console.log('');
        }
        
        if (problemas.precioMalFormato > 0) {
            console.log(`❌ Precio mal formateado: ${problemas.precioMalFormato} registros`);
            console.log('   Ejemplos:');
            ejemplos.precioMalFormato.forEach(e => console.log(`     Línea ${e.linea}: ${e.codigo} - ${e.precio}`));
            console.log('');
        }
        
        if (problemas.estadoInconsistente > 0) {
            console.log(`❌ Estado inconsistente: ${problemas.estadoInconsistente} registros`);
            console.log('   Ejemplos:');
            ejemplos.estadoInconsistente.forEach(e => console.log(`     Línea ${e.linea}: ${e.codigo} - "${e.estado}"`));
            console.log('');
        }
        
        if (problemas.condicionInconsistente > 0) {
            console.log(`❌ Condición inconsistente: ${problemas.condicionInconsistente} registros`);
            console.log('   Ejemplos:');
            ejemplos.condicionInconsistente.forEach(e => console.log(`     Línea ${e.linea}: ${e.codigo} - "${e.condicion}"`));
            console.log('');
        }
        
        console.log('📊 RESUMEN:');
        console.log(`   Total de registros: ${lines.length - 1}`);
        console.log(`   Total de problemas: ${Object.values(problemas).reduce((a, b) => a + b, 0)}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

revisarProblemas();

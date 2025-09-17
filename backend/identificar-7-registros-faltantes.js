const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function identificar7RegistrosFaltantes() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔌 Conectando a la base de datos...');

        // Leer el archivo CSV
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        console.log(`📊 Total de líneas en CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos (excluyendo header): ${lines.length - 1}`);

        // Obtener todos los códigos EFC de la base de datos
        const dbResult = await client.query('SELECT "codigoEFC" FROM inventory');
        const dbCodigos = new Set(dbResult.rows.map(row => row.codigoEFC));
        console.log(`📊 Registros en la base de datos: ${dbCodigos.size}`);

        // Procesar el CSV línea por línea
        const todosLosCodigosCsv = [];
        const registrosFaltantes = [];
        const lineasConProblemas = [];

        for (let i = 1; i < lines.length; i++) { // Empezar desde 1 (saltar header)
            const linea = lines[i];
            const columnas = linea.split(',');
            
            // Extraer código EFC
            const codigoEFC = columnas[0]?.trim();
            if (!codigoEFC) {
                lineasConProblemas.push({
                    numero: i + 1,
                    problema: 'Sin código EFC'
                });
                continue;
            }

            // Agregar a la lista de códigos del CSV
            todosLosCodigosCsv.push(codigoEFC);

            // Verificar si la línea tiene el número correcto de columnas
            if (columnas.length !== 27) {
                lineasConProblemas.push({
                    numero: i + 1,
                    codigoEFC: codigoEFC,
                    columnas: columnas.length,
                    problema: columnas.length < 27 ? 'Faltan columnas' : 'Sobran columnas'
                });
                continue; // Saltar esta línea
            }

            // Verificar si el código existe en la base de datos
            if (!dbCodigos.has(codigoEFC)) {
                registrosFaltantes.push({
                    numero: i + 1,
                    codigoEFC: codigoEFC,
                    marca: columnas[1]?.trim() || 'N/A',
                    modelo: columnas[2]?.trim() || 'N/A',
                    clasificacionId: columnas[25]?.trim() || 'N/A',
                    empleadoId: columnas[26]?.trim() || 'N/A',
                    columnas: columnas.length
                });
            }
        }

        console.log('\n❌ LOS 7 REGISTROS FALTANTES:');
        console.log('================================================================================');
        console.log(`Total registros faltantes: ${registrosFaltantes.length}`);
        
        if (registrosFaltantes.length > 0) {
            registrosFaltantes.forEach((item, index) => {
                console.log(`\n${index + 1}. Línea ${item.numero}:`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   Marca: ${item.marca}`);
                console.log(`   Modelo: ${item.modelo}`);
                console.log(`   Clasificación ID: ${item.clasificacionId}`);
                console.log(`   Empleado ID: ${item.empleadoId}`);
                console.log(`   Columnas: ${item.columnas}`);
            });
        }

        // Verificar si hay duplicados en el CSV
        console.log('\n🔍 VERIFICANDO DUPLICADOS EN EL CSV:');
        const codigoCounts = {};
        todosLosCodigosCsv.forEach(codigo => {
            codigoCounts[codigo] = (codigoCounts[codigo] || 0) + 1;
        });
        
        const duplicados = Object.entries(codigoCounts).filter(([codigo, count]) => count > 1);
        console.log(`📊 Códigos duplicados en CSV: ${duplicados.length}`);
        
        if (duplicados.length > 0) {
            console.log('\nDuplicados encontrados:');
            duplicados.forEach(([codigo, count]) => {
                console.log(`   "${codigo}" aparece ${count} veces`);
            });
        }

        // Verificar si hay códigos en BD que no están en CSV
        console.log('\n🔍 VERIFICANDO CÓDIGOS EN BD QUE NO ESTÁN EN CSV:');
        const codigosCsvSet = new Set(todosLosCodigosCsv);
        const codigosEnBdNoEnCsv = Array.from(dbCodigos).filter(codigo => !codigosCsvSet.has(codigo));
        
        console.log(`📊 Códigos en BD que no están en CSV: ${codigosEnBdNoEnCsv.length}`);
        if (codigosEnBdNoEnCsv.length > 0) {
            console.log('\nCódigos en BD que no están en CSV:');
            codigosEnBdNoEnCsv.forEach((codigo, index) => {
                console.log(`   ${index + 1}. ${codigo}`);
            });
        }

        console.log('\n📊 RESUMEN FINAL:');
        console.log('================================================================================');
        console.log(`Total líneas en CSV: ${lines.length - 1}`);
        console.log(`Registros en BD: ${dbCodigos.size}`);
        console.log(`Registros faltantes (válidos): ${registrosFaltantes.length}`);
        console.log(`Líneas con problemas de formato: ${lineasConProblemas.length}`);
        console.log(`Códigos duplicados en CSV: ${duplicados.length}`);
        console.log(`Códigos en BD que no están en CSV: ${codigosEnBdNoEnCsv.length}`);

        // Verificar la matemática
        const totalProcesadas = registrosFaltantes.length + lineasConProblemas.length;
        const diferencia = (lines.length - 1) - dbCodigos.size;
        console.log(`\n🧮 VERIFICACIÓN MATEMÁTICA:`);
        console.log(`Diferencia esperada: ${diferencia}`);
        console.log(`Total no procesadas: ${totalProcesadas}`);
        console.log(`¿Coincide? ${diferencia === totalProcesadas ? '✅ SÍ' : '❌ NO'}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

identificar7RegistrosFaltantes();

const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function identificarRegistrosNoCargados() {
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
        const registrosNoCargados = [];
        const lineasConProblemas = [];

        for (let i = 1; i < lines.length; i++) { // Empezar desde 1 (saltar header)
            const linea = lines[i];
            const columnas = linea.split(',');
            
            // Verificar si la línea tiene el número correcto de columnas
            if (columnas.length !== 27) {
                lineasConProblemas.push({
                    numero: i + 1,
                    columnas: columnas.length,
                    codigoEFC: columnas[0]?.trim() || 'Sin código',
                    problema: columnas.length < 27 ? 'Faltan columnas' : 'Sobran columnas'
                });
                continue; // Saltar esta línea
            }

            // Extraer código EFC
            const codigoEFC = columnas[0]?.trim();
            if (!codigoEFC) {
                lineasConProblemas.push({
                    numero: i + 1,
                    columnas: columnas.length,
                    codigoEFC: 'Sin código',
                    problema: 'Sin código EFC'
                });
                continue;
            }

            // Verificar si el código existe en la base de datos
            if (!dbCodigos.has(codigoEFC)) {
                registrosNoCargados.push({
                    numero: i + 1,
                    codigoEFC: codigoEFC,
                    marca: columnas[1]?.trim() || 'N/A',
                    modelo: columnas[2]?.trim() || 'N/A',
                    clasificacionId: columnas[25]?.trim() || 'N/A',
                    empleadoId: columnas[26]?.trim() || 'N/A'
                });
            }
        }

        console.log('\n❌ REGISTROS NO CARGADOS (líneas válidas que faltan en BD):');
        console.log('================================================================================');
        console.log(`Total: ${registrosNoCargados.length} registros`);
        
        if (registrosNoCargados.length > 0) {
            registrosNoCargados.forEach((item, index) => {
                console.log(`\n${index + 1}. Línea ${item.numero}:`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   Marca: ${item.marca}`);
                console.log(`   Modelo: ${item.modelo}`);
                console.log(`   Clasificación ID: ${item.clasificacionId}`);
                console.log(`   Empleado ID: ${item.empleadoId}`);
            });
        }

        console.log('\n⚠️ LÍNEAS CON PROBLEMAS DE FORMATO:');
        console.log('================================================================================');
        console.log(`Total: ${lineasConProblemas.length} líneas`);
        
        if (lineasConProblemas.length > 0) {
            // Mostrar solo las primeras 20 para no saturar la salida
            const mostrar = lineasConProblemas.slice(0, 20);
            mostrar.forEach((item, index) => {
                console.log(`\n${index + 1}. Línea ${item.numero}:`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   Columnas: ${item.columnas} (esperaba 27)`);
                console.log(`   Problema: ${item.problema}`);
            });
            
            if (lineasConProblemas.length > 20) {
                console.log(`\n... y ${lineasConProblemas.length - 20} líneas más con problemas de formato`);
            }
        }

        console.log('\n📊 RESUMEN:');
        console.log('================================================================================');
        console.log(`Total líneas en CSV: ${lines.length - 1}`);
        console.log(`Registros en BD: ${dbCodigos.size}`);
        console.log(`Registros no cargados (válidos): ${registrosNoCargados.length}`);
        console.log(`Líneas con problemas de formato: ${lineasConProblemas.length}`);
        console.log(`Total no procesadas: ${registrosNoCargados.length + lineasConProblemas.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

identificarRegistrosNoCargados();

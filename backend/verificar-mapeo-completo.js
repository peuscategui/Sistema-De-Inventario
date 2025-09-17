const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function verificarMapeoCompleto() {
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

        // Leer el CSV original para comparar
        console.log('📂 Leyendo CSV original...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header

        console.log(`📊 Total de líneas en CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        // Obtener todos los registros de la base de datos
        console.log('\n🔍 Obteniendo todos los registros de la base de datos...');
        const dbResult = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                i."empleadoId",
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                e.nombre,
                e.sede,
                e.gerencia
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            ORDER BY i.id
        `);

        console.log(`📊 Total de registros en BD: ${dbResult.rows.length}`);

        // Crear un mapa de códigos EFC para comparación
        const dbMap = new Map();
        dbResult.rows.forEach(item => {
            dbMap.set(item.codigoEFC, item);
        });

        let erroresEncontrados = 0;
        let registrosCorrectos = 0;

        console.log('\n🔍 VERIFICANDO MAPEO DE CLASIFICACIONID Y EMPLEADOID...');
        console.log('================================================================================');

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const lineNum = i + 2;
            const columns = line.split(',');

            if (columns.length < 27) {
                console.log(`⚠️ Línea ${lineNum}: Solo ${columns.length} columnas, saltando...`);
                continue;
            }

            const codigoEFC = columns[0]?.trim();
            if (!codigoEFC) continue;

            // Obtener clasificacionId y empleadoId del CSV
            let csvClasificacionId = null;
            let csvEmpleadoId = null;

            if (columns.length === 28) {
                // CSV con 28 columnas: clasificacionId en 25, empleadoId en 27
                csvClasificacionId = columns[25]?.trim();
                csvEmpleadoId = columns[27]?.trim();
            } else if (columns.length === 27) {
                // CSV con 27 columnas: clasificacionId en 25, empleadoId en 26
                csvClasificacionId = columns[25]?.trim();
                csvEmpleadoId = columns[26]?.trim();
            }

            // Convertir a números
            const csvClasificacionIdNum = csvClasificacionId && csvClasificacionId !== '00' && csvClasificacionId !== '00 ' ? parseInt(csvClasificacionId) : null;
            const csvEmpleadoIdNum = csvEmpleadoId && !isNaN(parseInt(csvEmpleadoId)) ? parseInt(csvEmpleadoId) : null;

            // Buscar en la base de datos
            const dbItem = dbMap.get(codigoEFC);

            if (dbItem) {
                const dbClasificacionId = dbItem.clasificacionId;
                const dbEmpleadoId = dbItem.empleadoId;

                // Verificar si hay diferencias
                const clasificacionCorrecta = dbClasificacionId === csvClasificacionIdNum;
                const empleadoCorrecto = dbEmpleadoId === csvEmpleadoIdNum;

                if (!clasificacionCorrecta || !empleadoCorrecto) {
                    erroresEncontrados++;
                    console.log(`\n❌ ERROR EN LÍNEA ${lineNum} (${codigoEFC}):`);
                    console.log(`   CSV - ClasificacionId: ${csvClasificacionId} (${csvClasificacionIdNum})`);
                    console.log(`   BD  - ClasificacionId: ${dbClasificacionId}`);
                    console.log(`   CSV - EmpleadoId: ${csvEmpleadoId} (${csvEmpleadoIdNum})`);
                    console.log(`   BD  - EmpleadoId: ${dbEmpleadoId}`);
                    console.log(`   Total columnas CSV: ${columns.length}`);
                    console.log(`   Línea CSV: ${line}`);
                } else {
                    registrosCorrectos++;
                }
            } else {
                console.log(`⚠️ Línea ${lineNum}: ${codigoEFC} no encontrado en BD`);
            }
        }

        console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
        console.log(`   ✅ Registros correctos: ${registrosCorrectos}`);
        console.log(`   ❌ Errores encontrados: ${erroresEncontrados}`);
        console.log(`   📊 Total verificados: ${registrosCorrectos + erroresEncontrados}`);

        if (erroresEncontrados > 0) {
            console.log('\n🔧 ¿Quieres corregir los errores automáticamente?');
            console.log('   - Sí: Los registros se actualizarán con los valores correctos del CSV');
            console.log('   - No: Solo se mostrará la información de errores');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarMapeoCompleto();

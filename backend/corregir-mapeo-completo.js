const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function corregirMapeoCompleto() {
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

        // Leer el CSV original
        console.log('📂 Leyendo CSV original...');
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header

        console.log(`📊 Total de líneas en CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos: ${dataLines.length}`);

        let correccionesRealizadas = 0;
        let erroresEnCorreccion = 0;

        console.log('\n🔧 CORRIGIENDO MAPEO DE CLASIFICACIONID Y EMPLEADOID...');
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
                // CSV con 28 columnas: clasificacionId en 26, empleadoId en 27
                csvClasificacionId = columns[26]?.trim();
                csvEmpleadoId = columns[27]?.trim();
            } else if (columns.length === 27) {
                // CSV con 27 columnas: clasificacionId en 25, empleadoId en 26
                csvClasificacionId = columns[25]?.trim();
                csvEmpleadoId = columns[26]?.trim();
            }

            // Convertir a números
            const csvClasificacionIdNum = csvClasificacionId && csvClasificacionId !== '00' && csvClasificacionId !== '00 ' ? parseInt(csvClasificacionId) : null;
            const csvEmpleadoIdNum = csvEmpleadoId && !isNaN(parseInt(csvEmpleadoId)) ? parseInt(csvEmpleadoId) : null;

            // Buscar el registro en la base de datos
            const dbResult = await client.query(`
                SELECT id, "clasificacionId", "empleadoId"
                FROM inventory
                WHERE "codigoEFC" = $1
            `, [codigoEFC]);

            if (dbResult.rows.length === 0) {
                console.log(`⚠️ Línea ${lineNum}: ${codigoEFC} no encontrado en BD`);
                continue;
            }

            const dbItem = dbResult.rows[0];
            const dbClasificacionId = dbItem.clasificacionId;
            const dbEmpleadoId = dbItem.empleadoId;

            // Verificar si hay diferencias
            const clasificacionCorrecta = dbClasificacionId === csvClasificacionIdNum;
            const empleadoCorrecto = dbEmpleadoId === csvEmpleadoIdNum;

            if (!clasificacionCorrecta || !empleadoCorrecto) {
                try {
                    // Actualizar el registro con los valores correctos del CSV
                    await client.query(`
                        UPDATE inventory 
                        SET "clasificacionId" = $1, "empleadoId" = $2
                        WHERE id = $3
                    `, [csvClasificacionIdNum, csvEmpleadoIdNum, dbItem.id]);

                    console.log(`✅ Línea ${lineNum} (${codigoEFC}):`);
                    console.log(`   ClasificacionId: ${dbClasificacionId} → ${csvClasificacionIdNum}`);
                    console.log(`   EmpleadoId: ${dbEmpleadoId} → ${csvEmpleadoIdNum}`);
                    
                    correccionesRealizadas++;
                } catch (error) {
                    console.error(`❌ Error actualizando línea ${lineNum} (${codigoEFC}): ${error.message}`);
                    erroresEnCorreccion++;
                }
            }
        }

        console.log('\n📊 RESUMEN DE CORRECCIONES:');
        console.log(`   ✅ Correcciones realizadas: ${correccionesRealizadas}`);
        console.log(`   ❌ Errores en corrección: ${erroresEnCorreccion}`);

        // Verificar el resultado final
        console.log('\n🔍 VERIFICANDO RESULTADO FINAL...');
        const verifyResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN "clasificacionId" IS NULL THEN 1 END) as null_clasificacion,
                COUNT(CASE WHEN "empleadoId" IS NULL THEN 1 END) as null_empleado
            FROM inventory
        `);

        console.log(`📊 Total de registros: ${verifyResult.rows[0].total}`);
        console.log(`📊 Registros con clasificacionId null: ${verifyResult.rows[0].null_clasificacion}`);
        console.log(`📊 Registros con empleadoId null: ${verifyResult.rows[0].null_empleado}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

corregirMapeoCompleto();

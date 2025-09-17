const { Client } = require('pg');

async function corregirClasificacionesNull() {
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

        // Obtener todos los registros con clasificacionId null
        console.log('🔍 Obteniendo registros con clasificacionId null...');
        const result = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                i."empleadoId"
            FROM inventory i
            WHERE i."clasificacionId" IS NULL
            ORDER BY i.id
        `);

        console.log(`📊 Registros con clasificacionId null: ${result.rows.length}`);

        if (result.rows.length === 0) {
            console.log('✅ No hay registros con clasificacionId null');
            return;
        }

        // Mostrar los primeros 10 registros
        console.log('\n📋 PRIMEROS 10 REGISTROS CON CLASIFICACIONID NULL:');
        result.rows.slice(0, 10).forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - ${item.codigoEFC} - ClasificacionId: ${item.clasificacionId} - EmpleadoId: ${item.empleadoId}`);
        });

        // Obtener todas las clasificaciones disponibles
        console.log('\n🔍 Obteniendo clasificaciones disponibles...');
        const clasificacionesResult = await client.query(`
            SELECT id, familia, tipo_equipo, sub_familia
            FROM clasificacion
            ORDER BY id
        `);

        console.log(`📊 Clasificaciones disponibles: ${clasificacionesResult.rows.length}`);
        clasificacionesResult.rows.forEach(clasificacion => {
            console.log(`   ${clasificacion.id}. ${clasificacion.familia} - ${clasificacion.tipo_equipo} - ${clasificacion.sub_familia}`);
        });

        console.log('\n🤔 ¿Qué quieres hacer?');
        console.log('1. Asignar clasificación 29 (Videovigilancia) a todos los registros con clasificacionId null');
        console.log('2. Asignar clasificación 6 (Computadora) a todos los registros con clasificacionId null');
        console.log('3. No hacer nada (solo mostrar información)');

        // Por ahora, voy a asignar clasificación 29 a los registros que parecen ser cámaras
        const camaraPatterns = ['CAM', 'AP-', 'AP '];
        let updatedCount = 0;

        for (const item of result.rows) {
            const codigoEFC = item.codigoEFC || '';
            let clasificacionId = null;

            // Determinar clasificación basada en el código EFC
            if (camaraPatterns.some(pattern => codigoEFC.includes(pattern))) {
                clasificacionId = 29; // Videovigilancia
            } else if (codigoEFC.includes('LT-') || codigoEFC.includes('LAPTOP')) {
                clasificacionId = 6; // Computadora
            } else if (codigoEFC.includes('PC-') || codigoEFC.includes('DESKTOP')) {
                clasificacionId = 6; // Computadora
            } else {
                clasificacionId = 6; // Por defecto, Computadora
            }

            try {
                await client.query(`
                    UPDATE inventory 
                    SET "clasificacionId" = $1 
                    WHERE id = $2
                `, [clasificacionId, item.id]);

                console.log(`✅ Actualizado ID ${item.id} (${codigoEFC}) -> ClasificacionId: ${clasificacionId}`);
                updatedCount++;
            } catch (error) {
                console.error(`❌ Error actualizando ID ${item.id}: ${error.message}`);
            }
        }

        console.log(`\n✅ Actualización completada: ${updatedCount} registros actualizados`);

        // Verificar el resultado
        const verifyResult = await client.query(`
            SELECT COUNT(*) as total
            FROM inventory
            WHERE "clasificacionId" IS NULL
        `);

        console.log(`📊 Registros restantes con clasificacionId null: ${verifyResult.rows[0].total}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

corregirClasificacionesNull();

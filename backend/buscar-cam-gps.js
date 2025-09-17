const { Client } = require('pg');

async function buscarCamGps() {
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

        // Buscar registros que contengan "CAM" y "GPS"
        console.log('🔍 Buscando registros con CAM y GPS...');
        const result = await client.query(`
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
            WHERE i."codigoEFC" LIKE '%CAM%' AND i."codigoEFC" LIKE '%GPS%'
            ORDER BY i.id
        `);

        console.log(`📊 Registros con CAM y GPS: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            result.rows.forEach((item, index) => {
                console.log(`\n📋 REGISTRO ${index + 1}:`);
                console.log(`   ID: ${item.id}`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   ClasificacionId: ${item.clasificacionId}`);
                console.log(`   EmpleadoId: ${item.empleadoId}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
                console.log(`   Empleado: ${item.nombre}`);
            });
        } else {
            console.log('❌ No se encontraron registros con CAM y GPS');
            
            // Buscar cualquier registro que contenga "CAM"
            console.log('\n🔍 Buscando cualquier registro con CAM...');
            const camResult = await client.query(`
                SELECT 
                    i.id,
                    i."codigoEFC",
                    i."clasificacionId",
                    i."empleadoId",
                    c.familia,
                    c.tipo_equipo
                FROM inventory i
                LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
                WHERE i."codigoEFC" LIKE '%CAM%'
                ORDER BY i.id
            `);
            
            console.log(`📊 Registros con CAM encontrados: ${camResult.rows.length}`);
            camResult.rows.forEach((item, index) => {
                console.log(`   ${index + 1}. ID: ${item.id} - ${item.codigoEFC} - ClasificacionId: ${item.clasificacionId} - Familia: ${item.familia}`);
            });
        }

        // También buscar registros que contengan "PISO" y "3"
        console.log('\n🔍 Buscando registros con PISO y 3...');
        const pisoResult = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                i."empleadoId",
                c.familia,
                c.tipo_equipo
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            WHERE i."codigoEFC" LIKE '%PISO%' AND i."codigoEFC" LIKE '%3%'
            ORDER BY i.id
        `);
        
        console.log(`📊 Registros con PISO y 3: ${pisoResult.rows.length}`);
        pisoResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - ${item.codigoEFC} - ClasificacionId: ${item.clasificacionId} - Familia: ${item.familia}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

buscarCamGps();

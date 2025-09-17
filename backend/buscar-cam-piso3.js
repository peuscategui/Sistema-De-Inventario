const { Client } = require('pg');

async function buscarCamPiso3() {
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

        // Buscar registros que contengan "CAM" y "PISO"
        console.log('🔍 Buscando registros con CAM y PISO...');
        const result = await client.query(`
            SELECT 
                i.*,
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                c.vida_util,
                c.valor_reposicion,
                e.nombre,
                e.sede,
                e.gerencia,
                e.cargo
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."codigoEFC" LIKE '%CAM%' AND i."codigoEFC" LIKE '%PISO%'
            ORDER BY i.id
        `);

        console.log(`📊 Registros encontrados: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            result.rows.forEach((item, index) => {
                console.log(`\n📋 REGISTRO ${index + 1}:`);
                console.log(`   ID: ${item.id}`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   ClasificacionId: ${item.clasificacionId}`);
                console.log(`   EmpleadoId: ${item.empleadoId}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
                console.log(`   Sub Familia: ${item.sub_familia}`);
                console.log(`   Empleado: ${item.nombre}`);
                console.log(`   Sede: ${item.sede}`);
                console.log(`   Gerencia: ${item.gerencia}`);
                console.log(`   Cargo: ${item.cargo}`);
            });
        } else {
            console.log('❌ No se encontraron registros con CAM y PISO');
            
            // Buscar cualquier registro que contenga "CAM"
            console.log('\n🔍 Buscando cualquier registro con CAM...');
            const camResult = await client.query(`
                SELECT 
                    i."codigoEFC",
                    i."clasificacionId",
                    c.familia,
                    c.tipo_equipo
                FROM inventory i
                LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
                WHERE i."codigoEFC" LIKE '%CAM%'
                ORDER BY i.id
                LIMIT 5
            `);
            
            console.log(`📊 Registros con CAM encontrados: ${camResult.rows.length}`);
            camResult.rows.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.codigoEFC} - ClasificacionId: ${item.clasificacionId} - Familia: ${item.familia}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

buscarCamPiso3();
